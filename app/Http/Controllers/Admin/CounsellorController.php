<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCounsellorRequest;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CounsellorController extends Controller
{
    /**
     * UM01 Onboard Counselor — list, search, and filter counsellor (PPsi)
     * records for the admin portal.
     */
    public function index(): Response
    {
        return Inertia::render('admin/counsellor-ppsi', [
            'counsellors' => Counsellor::with('location')
                ->orderByDesc('created_at')
                ->get()
                ->map(fn (Counsellor $counsellor) => $this->present($counsellor)),
            'locations' => CounsellingLocation::where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    /**
     * UM01 AF1 — add counsellor record. Also creates (or links) a User
     * account with the counselor role when an email is provided, so the
     * onboarded counsellor can actually log in per UM01's postcondition
     * ("counsellor becomes available for... counsellor portal access").
     */
    public function store(StoreCounsellorRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data) {
            $userId = null;

            if (! empty($data['email'])) {
                $user = User::firstOrCreate(
                    ['email' => $data['email']],
                    [
                        'name' => $data['name'],
                        'role' => UserRole::Counselor,
                        'password_hash' => Hash::make(Str::random(24)),
                    ]
                );
                $userId = $user->id;
            }

            Counsellor::create([...$data, 'user_id' => $userId]);
        });

        return back()->with('success', "Counsellor {$data['name']} saved successfully.");
    }

    private function present(Counsellor $counsellor): array
    {
        return [
            'id' => $counsellor->id,
            'ppsiNo' => $counsellor->ppsi_no,
            'workerNo' => $counsellor->worker_no,
            'type' => $counsellor->counsellor_type->value,
            'name' => $counsellor->name,
            'organization' => $counsellor->organization,
            'locationId' => $counsellor->location_id,
            'location' => $counsellor->location?->name ?? '-',
            'status' => $counsellor->status->value,
            'startDate' => optional($counsellor->start_date)->toDateString(),
            'endDate' => optional($counsellor->end_date)->toDateString(),
            'email' => $counsellor->email,
            'phone' => $counsellor->phone,
        ];
    }
}
