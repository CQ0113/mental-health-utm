<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyAccountController extends Controller
{
    /**
     * UM03 AF1 — Client reviews their own locked profile through My
     * Account. Only fields that exist on the clients table are real; the
     * rest of the tabs (study/marriage/health/confirmation) keep their
     * existing static content since there is no schema backing for them.
     */
    public function show(Request $request): Response
    {
        $client = $request->user()->client;

        return Inertia::render('psycare/perkhidmatan', [
            'myClientProfile' => $client ? [
                'fullName' => $client->full_name,
                'preferredName' => $client->preferred_name,
                'clientType' => $client->client_type->value,
                'nationalId' => $client->national_id,
                'email' => $client->email,
                'phone' => $client->phone,
                'currentAddress' => $client->current_address,
                'faculty' => $client->faculty,
                'program' => $client->program,
                'matrixNo' => $client->matrix_no,
                'studentNo' => $client->student_no,
                'workerNo' => $client->worker_no,
                'maritalStatus' => $client->marital_status,
                'profileLocked' => $client->profile_locked,
            ] : null,
        ]);
    }
}
