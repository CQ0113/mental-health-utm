<?php

namespace App\Http\Controllers\Counsellor;

use App\Enums\AppointmentStatus;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AS07 Verify Appointment — Counsellor half. Final approval, only available
 * once Admin has moved the request to `needs_review`/`counsellor_reviewing`
 * (EF3). Same "queue-only wired, other tabs stay mock" scope note as
 * Admin\AppointmentController.
 */
class AppointmentController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('counsellor/appointments', [
            'appointments' => Appointment::with('client', 'counsellor', 'location', 'slot')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->present($appointment)),
        ]);
    }

    public function review(Request $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validate([
            'note' => ['nullable', 'string'],
        ]);

        if (! in_array($appointment->status, [AppointmentStatus::NeedsReview, AppointmentStatus::CounsellorReviewing], true)) {
            throw ValidationException::withMessages([
                'decision' => 'Admin approval is required before Counsellor approval.',
            ]);
        }

        $appointment->update([
            'status' => AppointmentStatus::Approved,
            'counsellor_review_by_user_id' => $request->user()->id,
            'counsellor_review_note' => $data['note'] ?? null,
            'counsellor_reviewed_at' => now(),
        ]);

        return back()->with('success', "Appointment {$appointment->reference_no} approved.");
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
