<?php

namespace App\Http\Controllers\Counsellor;

use App\Http\Controllers\Controller;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Services\SlotScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AS04 Manage Slots / AS05 Bulk Generate Slots / AS06 Import CSV Template
 * — Counsellor half. A Counsellor only sees and edits their own slots:
 * new slots are force-assigned to them and deleting anyone else's slot is
 * rejected server-side, not just hidden in the UI. Deliberately a separate
 * controller/page from Admin\SlotController, not the same page branching
 * on role.
 */
class SlotController extends Controller
{
    public function __construct(private readonly SlotScheduleService $slots) {}

    public function index(Request $request): Response
    {
        $counsellor = $this->ownCounsellor($request);

        return Inertia::render('counsellor/slots', [
            'slots' => $this->slots->presentUpcoming($counsellor->id),
            'locations' => CounsellingLocation::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'counsellorId' => $counsellor->id,
            'counsellorName' => $counsellor->name,
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $counsellor = $this->ownCounsellor($request);

        $data = $request->validate($this->slots->validationRules());

        // Every new slot belongs to the counsellor themselves, whatever the
        // payload claimed.
        $newSlots = array_map(function (array $slot) use ($counsellor) {
            $slot['counsellor_id'] = $counsellor->id;

            return $slot;
        }, $data['new_slots'] ?? []);

        $deletedIds = $data['deleted_slot_ids'] ?? [];
        $this->slots->assertOwnsDeletions($deletedIds, $counsellor->id);

        $this->slots->persist(
            $newSlots,
            $deletedIds,
            $data['generation_method'] ?? 'manual',
            $data['summary'] ?? null,
            $request->user()->id,
        );

        return back()->with('success', 'Your slot schedule was saved successfully. Client booking will use this updated schedule.');
    }

    /**
     * The Counsellor record linked to the logged-in user. 403s rather than
     * silently doing nothing if a counsellor account has no linked record.
     */
    private function ownCounsellor(Request $request): Counsellor
    {
        return $request->user()->counsellor
            ?? abort(403, 'No counsellor profile is linked to your account.');
    }
}
