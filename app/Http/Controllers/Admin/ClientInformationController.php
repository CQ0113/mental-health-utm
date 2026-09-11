<?php

namespace App\Http\Controllers\Admin;

use App\Enums\AccountStatus;
use App\Enums\AppointmentStatus;
use App\Enums\AppointmentType;
use App\Enums\SessionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClientRequest;
use App\Http\Requests\Admin\UpdateClientRequest;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Services\DeclarationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ClientInformationController extends Controller
{
    public function __construct(private readonly DeclarationService $declarations) {}

    /**
     * UM02 Find Client Profile / UM03 Manage User Profile (Admin) — the
     * admin "Client Information" page is Client + Appointment (intake case)
     * combined, matching the documented form fields (reference no,
     * application type, counsellor, appointment need...) which are really
     * Appointment attributes, not Client ones. Only the "maklumat-klien"
     * list/form and "maklumat-peribadi" detail tab are wired to real data
     * in this phase — study/marriage/health/session/screening/attachment
     * tabs stay on their existing mock content (separate module phases, or
     * fields with no schema backing at all). The Pengesahan/Confirmation
     * tab became real in Phase 3 (DC03 Verify Declaration).
     */
    public function index(): Response
    {
        return Inertia::render('admin/client-information', [
            'records' => Appointment::with([
                'location',
                'counsellor',
                'client.user',
                // Profile-level declarations only (appointment_id null) —
                // eager-loaded so the list doesn't fire one query per row.
                'client.declarations' => fn ($query) => $query
                    ->whereNull('appointment_id')
                    ->with('verifiedBy')
                    ->latest('created_at'),
            ])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Appointment $appointment) => $this->present($appointment)),
            'locations' => CounsellingLocation::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'counsellors' => Counsellor::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreClientRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $client = Client::create([
                'full_name' => $data['full_name'],
                'client_type' => $data['client_type'],
                'faculty' => $data['faculty'],
                'matrix_no' => $data['matrix_no'] ?? null,
                'worker_no' => $data['worker_no'] ?? null,
                'profile_locked' => true,
            ]);

            Appointment::create([
                'reference_no' => $data['reference_no'],
                'client_id' => $client->id,
                'appointment_type' => AppointmentType::New,
                'session_type' => SessionType::Physical,
                'location_id' => $data['location_id'],
                'counsellor_id' => $data['counsellor_id'] ?? null,
                'appointment_need' => $data['appointment_need'] ?? null,
                'attended_before' => $data['attended_before'],
                'status' => AppointmentStatus::Pending,
            ]);
        });

        return back()->with('success', "Client record {$data['reference_no']} added successfully.");
    }

    public function update(UpdateClientRequest $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $appointment) {
            $appointment->client?->update([
                'full_name' => $data['full_name'],
                'client_type' => $data['client_type'],
                'faculty' => $data['faculty'],
                'matrix_no' => $data['matrix_no'] ?? null,
                'worker_no' => $data['worker_no'] ?? null,
            ]);

            $appointment->update([
                'reference_no' => $data['reference_no'],
                'location_id' => $data['location_id'],
                'counsellor_id' => $data['counsellor_id'] ?? null,
                'appointment_need' => $data['appointment_need'] ?? null,
                'attended_before' => $data['attended_before'],
            ]);
        });

        return back()->with('success', "Client record {$data['reference_no']} updated successfully.");
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $referenceNo = $appointment->reference_no;
        $appointment->delete();

        return back()->with('success', "Client record {$referenceNo} removed.");
    }

    private function present(Appointment $appointment): array
    {
        $client = $appointment->client;

        return [
            'id' => $appointment->id,
            'clientId' => $client?->id,
            'referenceNo' => $appointment->reference_no,
            'locationId' => $appointment->location_id,
            'location' => $appointment->location?->name ?? '-',
            'counsellorId' => $appointment->counsellor_id,
            'counselorName' => $appointment->counsellor?->name ?? '-',
            'appointmentNeed' => $appointment->appointment_need,
            'attendedBefore' => $appointment->attended_before,
            // `clients` has no status column of its own (Phase 1), so the
            // admin list shows the linked login account's state — anything
            // other than an active account reads as inactive here. Without
            // this the page crashed: the UI calls `record.status
            // .toUpperCase()` and the key was simply missing.
            'status' => $client?->user?->status === AccountStatus::Active || $client?->user === null
                ? 'active'
                : 'inactive',
            'clientType' => $client?->client_type->value,
            'clientName' => $client?->full_name,
            'faculty' => $client?->faculty,
            'matrixNo' => $client?->matrix_no ?? '-',
            'workerNo' => $client?->worker_no ?? '-',
            'nationalId' => $client?->national_id ?? '-',
            'email' => $client?->email ?? '-',
            'phone' => $client?->phone ?? '-',
            'currentAddress' => $client?->current_address ?? '-',
            // DC03 — the client's profile-level declaration, null until they
            // submit one. Repeats across a client's records by design: it
            // declares the profile, not this particular appointment.
            'declaration' => $this->declarations->present($client?->declarations->first()),
        ];
    }
}
