<?php

namespace App\Services;

use App\Models\AppointmentSlot;
use App\Models\AppointmentSlotSessionType;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\SlotGenerationBatch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Shared AS04/AS05/AS06 persistence logic used by both Admin\SlotController
 * (manages every counsellor's slots) and Counsellor\SlotController (manages
 * only the logged-in counsellor's own) — kept as one service rather than
 * duplicated so the overlap-checking and save-transaction behaviour can't
 * drift between the two roles.
 *
 * Everything here is written as a handful of bulk queries rather than
 * one-row-at-a-time queries in a loop: this app talks to a remote Supabase
 * Postgres instance, so every extra round trip costs real latency — a save
 * with a few hundred slots (a realistic AS05 bulk generate or AS06 CSV
 * import) blew through PHP's 30s execution limit. Two separate causes, both
 * fixed here: N one-row-at-a-time inserts, and — the bigger one — Laravel's
 * `exists:` validation rule on a `field.*.x` wildcard runs one query PER
 * ARRAY ITEM rather than batching, so 360 slots meant 720 existence-check
 * queries before a single row was even saved. Validation here only checks
 * format (`uuid`); referential integrity is checked in bulk in persist().
 */
class SlotScheduleService
{
    public function validationRules(): array
    {
        return [
            'new_slots' => ['array'],
            'new_slots.*.slot_date' => ['required', 'date'],
            'new_slots.*.start_time' => ['required', 'date_format:H:i'],
            'new_slots.*.end_time' => ['required', 'date_format:H:i', 'after:new_slots.*.start_time'],
            'new_slots.*.counsellor_id' => ['nullable', 'uuid'],
            'new_slots.*.location_id' => ['nullable', 'uuid'],
            'new_slots.*.capacity' => ['nullable', 'integer', 'min:1'],
            'new_slots.*.session_types' => ['required', 'array', 'min:1'],
            'new_slots.*.session_types.*' => ['in:physical,online'],
            'deleted_slot_ids' => ['array'],
            'deleted_slot_ids.*' => ['uuid'],
            'generation_method' => ['nullable', 'in:manual,bulk,csv'],
            'summary' => ['nullable', 'string'],
        ];
    }

    /**
     * Upcoming (today or later) slots, presented for the frontend.
     * $counsellorId narrows to one counsellor; null returns every slot.
     * One query for the slots (+ eager-loaded relations), one aggregate
     * query for booked counts — not a per-slot count query.
     */
    public function presentUpcoming(?string $counsellorId): Collection
    {
        return AppointmentSlot::with(['sessionTypes', 'counsellor', 'location'])
            ->withCount('appointments')
            ->when($counsellorId, fn ($query) => $query->where('counsellor_id', $counsellorId))
            ->where('slot_date', '>=', now()->toDateString())
            ->orderBy('slot_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn (AppointmentSlot $slot) => $this->present($slot));
    }

    /**
     * AS04 AF5 "Save Slot Changes" — the only point that actually writes to
     * storage. $newSlots/$deletedIds are already validated and, for a
     * counsellor-scoped save, already had ownership enforced by the caller.
     */
    public function persist(array $newSlots, array $deletedIds, string $generationMethod, ?string $summary, string $createdByUserId): void
    {
        $this->assertReferencesExist($newSlots);
        $this->assertDeletionsExist($deletedIds);
        $this->assertNoOverlaps($newSlots, $deletedIds);

        DB::transaction(function () use ($newSlots, $deletedIds, $generationMethod, $summary, $createdByUserId) {
            if ($deletedIds !== []) {
                AppointmentSlotSessionType::whereIn('slot_id', $deletedIds)->delete();
                AppointmentSlot::whereIn('id', $deletedIds)->delete();
            }

            if ($newSlots === []) {
                return;
            }

            $batch = SlotGenerationBatch::create([
                'created_at' => now(),
                'created_by_user_id' => $createdByUserId,
                'generation_method' => $generationMethod,
                'start_date' => collect($newSlots)->min('slot_date'),
                'end_date' => collect($newSlots)->max('slot_date'),
                'replace_existing' => $deletedIds !== [],
                'total_rows' => count($newSlots),
                'valid_rows' => count($newSlots),
                'skipped_rows' => 0,
                'summary' => $summary,
            ]);

            // A plain string, not a Carbon instance — raw query-builder
            // insert() binds values straight to PDO, it doesn't run them
            // through Eloquent's date-cast serialization first.
            $now = now()->toDateTimeString();
            $slotRows = [];
            $sessionTypeRows = [];

            foreach ($newSlots as $slotData) {
                $slotId = (string) Str::uuid();

                $slotRows[] = [
                    'id' => $slotId,
                    'slot_date' => $slotData['slot_date'],
                    'start_time' => $slotData['start_time'],
                    'end_time' => $slotData['end_time'],
                    'label' => $this->buildLabel($slotData['start_time'], $slotData['end_time']),
                    'counsellor_id' => $slotData['counsellor_id'] ?? null,
                    'location_id' => $slotData['location_id'] ?? null,
                    'batch_id' => $batch->id,
                    'capacity' => $slotData['capacity'] ?? 1,
                    'is_active' => true,
                    'created_by_user_id' => $createdByUserId,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                foreach (array_unique($slotData['session_types']) as $sessionType) {
                    $sessionTypeRows[] = [
                        'slot_id' => $slotId,
                        'session_type' => $sessionType,
                    ];
                }
            }

            // Raw bulk inserts (not Model::create() in a loop) — one query
            // per chunk instead of one query per row. Chunked defensively
            // in case a very large CSV import approaches Postgres's bound
            // parameter limit.
            foreach (array_chunk($slotRows, 500) as $chunk) {
                AppointmentSlot::insert($chunk);
            }

            foreach (array_chunk($sessionTypeRows, 500) as $chunk) {
                AppointmentSlotSessionType::insert($chunk);
            }
        });
    }

    /**
     * A counsellor can only ever remove their own slots — throws if
     * $deletedIds references a slot belonging to someone else (or nobody).
     */
    public function assertOwnsDeletions(array $deletedIds, string $counsellorId): void
    {
        $foreignDeletions = AppointmentSlot::whereIn('id', $deletedIds)
            ->where(fn ($query) => $query
                ->whereNull('counsellor_id')
                ->orWhere('counsellor_id', '!=', $counsellorId))
            ->exists();

        if ($foreignDeletions) {
            throw ValidationException::withMessages([
                'deleted_slot_ids' => 'You can only remove your own slots.',
            ]);
        }
    }

    /**
     * Referential integrity for counsellor_id/location_id — deliberately
     * not a Laravel `exists:` validation rule (see the class doc comment):
     * one `whereIn` per field, not one query per array item.
     */
    private function assertReferencesExist(array $newSlots): void
    {
        if ($newSlots === []) {
            return;
        }

        $counsellorIds = collect($newSlots)->pluck('counsellor_id')->filter()->unique()->values();
        $locationIds = collect($newSlots)->pluck('location_id')->filter()->unique()->values();

        if ($counsellorIds->isNotEmpty()) {
            $missing = $counsellorIds->diff(Counsellor::whereIn('id', $counsellorIds)->pluck('id'));

            if ($missing->isNotEmpty()) {
                $index = collect($newSlots)->search(fn ($slot) => in_array($slot['counsellor_id'] ?? null, $missing->all(), true));

                throw ValidationException::withMessages([
                    "new_slots.{$index}.counsellor_id" => 'The selected counsellor does not exist.',
                ]);
            }
        }

        if ($locationIds->isNotEmpty()) {
            $missing = $locationIds->diff(CounsellingLocation::whereIn('id', $locationIds)->pluck('id'));

            if ($missing->isNotEmpty()) {
                $index = collect($newSlots)->search(fn ($slot) => in_array($slot['location_id'] ?? null, $missing->all(), true));

                throw ValidationException::withMessages([
                    "new_slots.{$index}.location_id" => 'The selected location does not exist.',
                ]);
            }
        }
    }

    /**
     * Referential integrity for deleted_slot_ids — same reasoning as
     * assertReferencesExist(): one count query, not one exists check per id.
     */
    private function assertDeletionsExist(array $deletedIds): void
    {
        if ($deletedIds === []) {
            return;
        }

        $uniqueIds = array_unique($deletedIds);
        $existingCount = AppointmentSlot::whereIn('id', $uniqueIds)->count();

        if ($existingCount !== count($uniqueIds)) {
            throw ValidationException::withMessages([
                'deleted_slot_ids' => 'One or more selected slots could not be found.',
            ]);
        }
    }

    /**
     * EF2 — "the selected slot time is invalid or conflicts with another
     * slot." Checked per counsellor, per date: new slots against each other
     * and against existing (non-deleted) DB slots. One query fetches every
     * potentially-conflicting existing slot up front; the actual overlap
     * comparison happens in memory — not one query per counsellor/date pair.
     */
    private function assertNoOverlaps(array $newSlots, array $deletedIds): void
    {
        if ($newSlots === []) {
            return;
        }

        $byCounsellorDate = [];

        foreach ($newSlots as $index => $slot) {
            $key = ($slot['counsellor_id'] ?? 'none').'|'.$slot['slot_date'];
            $byCounsellorDate[$key][] = ['index' => $index, ...$slot];
        }

        $counsellorIds = collect($newSlots)->pluck('counsellor_id')->filter()->unique()->values();
        $hasUnassigned = collect($newSlots)->contains(fn ($slot) => empty($slot['counsellor_id']));
        $dates = collect($newSlots)->pluck('slot_date');

        $existing = AppointmentSlot::query()
            // whereDate(), not whereBetween() against raw strings — some
            // drivers (SQLite, in tests) store the date column with a time
            // suffix, which breaks a plain string range comparison.
            ->whereDate('slot_date', '>=', $dates->min())
            ->whereDate('slot_date', '<=', $dates->max())
            ->when($deletedIds !== [], fn ($query) => $query->whereNotIn('id', $deletedIds))
            ->where(function ($query) use ($counsellorIds, $hasUnassigned) {
                if ($counsellorIds->isNotEmpty()) {
                    $query->whereIn('counsellor_id', $counsellorIds);
                }

                if ($hasUnassigned) {
                    $query->orWhereNull('counsellor_id');
                }
            })
            ->get(['counsellor_id', 'slot_date', 'start_time', 'end_time']);

        $normalize = fn (string $time) => substr($time, 0, 5);
        $existingByCounsellorDate = [];

        foreach ($existing as $row) {
            $key = ($row->counsellor_id ?? 'none').'|'.$row->slot_date->toDateString();
            $existingByCounsellorDate[$key][] = [$normalize($row->start_time), $normalize($row->end_time)];
        }

        foreach ($byCounsellorDate as $key => $slots) {
            $ranges = $existingByCounsellorDate[$key] ?? [];

            foreach ($slots as $slot) {
                foreach ($ranges as $range) {
                    if ($slot['start_time'] < $range[1] && $range[0] < $slot['end_time']) {
                        throw ValidationException::withMessages([
                            "new_slots.{$slot['index']}.start_time" => 'This slot time is invalid or conflicts with another slot for the same counsellor on this date.',
                        ]);
                    }
                }

                $ranges[] = [$slot['start_time'], $slot['end_time']];
            }
        }
    }

    private function buildLabel(string $start, string $end): string
    {
        $format = fn (string $time) => date('h:i A', strtotime($time));

        return sprintf('%s - %s', $format($start), $format($end));
    }

    private function present(AppointmentSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'slotDate' => $slot->slot_date->toDateString(),
            'startTime' => substr($slot->start_time, 0, 5),
            'endTime' => substr($slot->end_time, 0, 5),
            'label' => $slot->label,
            'counsellorId' => $slot->counsellor_id,
            'counsellorName' => $slot->counsellor?->name ?? '-',
            'locationId' => $slot->location_id,
            'locationName' => $slot->location?->name ?? '-',
            'capacity' => $slot->capacity,
            'bookedCount' => $slot->appointments_count,
            'sessionTypes' => $slot->sessionTypes->pluck('session_type')->map(fn ($type) => $type->value)->all(),
        ];
    }
}
