<?php

namespace App\Http\Controllers;

use App\Enums\AppointmentStatus;
use App\Enums\AppointmentType;
use App\Enums\SessionType;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\CounsellingLocation;
use App\Services\MeetingLinkService;
use App\Support\AppointmentReferenceNumber;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AS01 Book Appointment / AS02 Request follow up / AS03 Book New Appointment
 * (Smart Appointment Form) — implemented as one controller since the three
 * use cases share a single form/submission (AS01 is the base flow, AS02/AS03
 * just change what's pre-filled before Submit).
 */
class AppointmentController extends Controller
{
    public function create(Request $request): Response
    {
        $client = $request->user()->client;

        $slots = AppointmentSlot::with(['sessionTypes', 'counsellor', 'location'])
            ->where('is_active', true)
            ->where('slot_date', '>=', now()->toDateString())
            ->orderBy('slot_date')
            ->orderBy('start_time')
            ->get()
            ->map(fn (AppointmentSlot $slot) => [
                'id' => $slot->id,
                'slotDate' => $slot->slot_date->toDateString(),
                'startTime' => substr($slot->start_time, 0, 5),
                'endTime' => substr($slot->end_time, 0, 5),
                'label' => $slot->label,
                'counsellorId' => $slot->counsellor_id,
                'counsellorName' => $slot->counsellor?->name ?? '-',
                'locationId' => $slot->location_id,
                'locationName' => $slot->location?->name ?? '-',
                'sessionTypes' => $slot->sessionTypes->pluck('session_type')->map(fn ($type) => $type->value)->all(),
                'remainingCapacity' => $slot->capacity - $slot->appointments()->count(),
            ])
            ->filter(fn (array $slot) => $slot['remainingCapacity'] > 0)
            ->values();

        $followUpEligible = collect();

        if ($client) {
            $followUpEligible = Appointment::where('client_id', $client->id)
                ->where('status', AppointmentStatus::FollowUp)
                ->with('counsellor')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->presentSummary($appointment));
        }

        return Inertia::render('psycare/permohonan', [
            'availableSlots' => $slots,
            'locations' => CounsellingLocation::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'client' => $client ? [
                'fullName' => $client->full_name,
                'matrixOrWorkerNo' => $client->matrix_no ?? $client->worker_no ?? '-',
                'faculty' => $client->faculty ?? '-',
                'clientType' => $client->client_type?->value,
            ] : null,
            'followUpEligibleAppointments' => $followUpEligible,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $client = $request->user()->client;

        if (! $client) {
            abort(403, 'Only clients with a profile can book appointments.');
        }

        $data = $request->validate([
            'appointment_type' => ['required', Rule::in(['new', 'follow_up'])],
            'previous_appointment_id' => ['nullable', 'required_if:appointment_type,follow_up', 'uuid', 'exists:appointments,id'],
            'session_type' => ['required', Rule::in(['physical', 'online'])],
            'slot_id' => ['required', 'uuid', 'exists:appointment_slots,id'],
            'location_id' => ['nullable', 'uuid', 'exists:counselling_locations,id'],
            'appointment_need' => ['nullable', 'string'],
            'issue_summary' => ['nullable', 'string'],
            'attachment_description' => ['nullable', 'string'],
            'applicant_note' => ['nullable', 'string'],
            'attended_before' => ['nullable', 'boolean'],
        ]);

        $slot = AppointmentSlot::with('sessionTypes')->findOrFail($data['slot_id']);

        $remainingCapacity = $slot->capacity - $slot->appointments()->count();

        if ($remainingCapacity <= 0) {
            throw ValidationException::withMessages([
                'slot_id' => 'This slot is no longer available. Please choose another date or session type.',
            ]);
        }

        $allowedTypes = $slot->sessionTypes->pluck('session_type')->map(fn ($type) => $type->value)->all();

        if (! in_array($data['session_type'], $allowedTypes, true)) {
            throw ValidationException::withMessages([
                'session_type' => 'This slot does not support the selected session type. Please choose another date or session type.',
            ]);
        }

        $previousAppointment = null;

        if ($data['appointment_type'] === 'follow_up') {
            $previousAppointment = Appointment::where('id', $data['previous_appointment_id'])
                ->where('client_id', $client->id)
                ->first();

            if (! $previousAppointment || $previousAppointment->status !== AppointmentStatus::FollowUp) {
                throw ValidationException::withMessages([
                    'previous_appointment_id' => 'The selected appointment cannot be used for follow-up.',
                ]);
            }
        }

        $location = $data['location_id'] ?? null
            ? CounsellingLocation::find($data['location_id'])
            : $slot->location;

        $appointment = Appointment::create([
            'reference_no' => AppointmentReferenceNumber::generate($location),
            'client_id' => $client->id,
            'requested_by_user_id' => $request->user()->id,
            'previous_appointment_id' => $previousAppointment?->id,
            'appointment_type' => AppointmentType::from($data['appointment_type']),
            'session_type' => SessionType::from($data['session_type']),
            'location_id' => $location?->id,
            'slot_id' => $slot->id,
            'counsellor_id' => $slot->counsellor_id,
            'preferred_date' => $slot->slot_date,
            'appointment_need' => $data['appointment_need'] ?? null,
            'issue_summary' => $data['issue_summary'] ?? null,
            'attachment_description' => $data['attachment_description'] ?? null,
            'applicant_note' => $data['applicant_note'] ?? null,
            'attended_before' => $data['attended_before'] ?? false,
            'status' => AppointmentStatus::Pending,
            'submitted_at' => now(),
        ]);

        if ($appointment->session_type === SessionType::Online) {
            $appointment->update([
                'meeting_link' => app(MeetingLinkService::class)->createRoomFor($appointment),
            ]);
        }

        return back()->with('success', sprintf(
            'Appointment request %s submitted successfully for %s (%s).%s',
            $appointment->reference_no,
            $slot->slot_date->toDateString(),
            $slot->label,
            $appointment->meeting_link ? " Meeting link: {$appointment->meeting_link}" : '',
        ));
    }

    public function records(Request $request): Response
    {
        $client = $request->user()->client;

        $appointments = $client
            ? Appointment::where('client_id', $client->id)
                ->with('counsellor', 'slot')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->presentSummary($appointment))
            : collect();

        return Inertia::render('psycare/rekod-temujanji', [
            'appointments' => $appointments,
        ]);
    }

    private function presentSummary(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'referenceNo' => $appointment->reference_no,
            'date' => $appointment->preferred_date?->toDateString() ?? $appointment->slot?->slot_date?->toDateString(),
            'slotLabel' => $appointment->slot?->label ?? '-',
            'counselorName' => $appointment->counsellor?->name ?? '-',
            'sessionType' => $appointment->session_type->value,
            'status' => $appointment->status->value,
        ];
    }
}
