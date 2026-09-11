<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AS07 Verify Appointment — Admin half. First-level review: Admin moves a
 * pending request to `needs_review` or `counsellor_reviewing`, only after
 * which the Counsellor half (Counsellor\AppointmentController) can approve.
 *
 * Only the queue/review data is wired to the database here. The existing
 * mock-data "Create Appointment" (walk-in/group session) modal, attendance
 * modal, and report modal on this page are outside AS01–AS07's scope
 * (Attendance is Phase 4) and are left on their current mock content.
 */
class AppointmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/appointments', [
            'appointments' => Appointment::with('client', 'counsellor', 'location', 'slot')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->present($appointment)),
        ]);
    }

    public function review(Request $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validate([
            'decision' => ['required', Rule::in(['needs_review', 'counsellor_reviewing'])],
            'note' => ['nullable', 'string'],
        ]);

        if ($appointment->status !== AppointmentStatus::Pending) {
            throw ValidationException::withMessages([
                'decision' => 'This appointment request has already been reviewed.',
            ]);
        }

        $appointment->update([
            'status' => AppointmentStatus::from($data['decision']),
            'admin_review_by_user_id' => $request->user()->id,
            'admin_review_note' => $data['note'] ?? null,
            'admin_reviewed_at' => now(),
        ]);

        return back()->with('success', "Appointment {$appointment->reference_no} moved to {$appointment->status->value}.");
    }

    private function present(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'referenceNo' => $appointment->reference_no,
            'clientName' => $appointment->client?->full_name ?? '-',
            'sessionType' => $appointment->session_type->value,
            'appointmentType' => $appointment->appointment_type->value,
            'preferredDate' => $appointment->preferred_date?->toDateString(),
            'slotLabel' => $appointment->slot?->label ?? '-',
            'location' => $appointment->location?->name ?? '-',
            'counselorName' => $appointment->counsellor?->name ?? '-',
            'appointmentNeed' => $appointment->appointment_need,
            'issueSummary' => $appointment->issue_summary,
            'attendedBefore' => $appointment->attended_before,
            'status' => $appointment->status->value,
            'adminReviewNote' => $appointment->admin_review_note,
            'adminReviewedAt' => $appointment->admin_reviewed_at?->toDateTimeString(),
            'counsellorReviewNote' => $appointment->counsellor_review_note,
            'counsellorReviewedAt' => $appointment->counsellor_reviewed_at?->toDateTimeString(),
            'meetingLink' => $appointment->meeting_link,
        ];
    }
}
