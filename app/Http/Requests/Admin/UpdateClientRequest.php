<?php

namespace App\Http\Requests\Admin;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        /** @var Appointment $appointment */
        $appointment = $this->route('appointment');

        return [
            'reference_no' => [
                'required', 'string', 'max:100',
                Rule::unique('appointments', 'reference_no')->ignore($appointment->id),
            ],
            'location_id' => ['required', 'uuid', 'exists:counselling_locations,id'],
            'counsellor_id' => ['nullable', 'uuid', 'exists:counsellors,id'],
            'appointment_need' => ['nullable', 'string', 'max:2000'],
            'attended_before' => ['required', 'boolean'],
            'client_type' => ['required', 'in:student,staff,alumni'],
            'full_name' => ['required', 'string', 'max:255'],
            'faculty' => ['required', 'string', 'max:255'],
            'matrix_no' => [
                'nullable', 'string', 'max:50', 'required_if:client_type,student',
                Rule::unique('clients', 'matrix_no')->ignore($appointment->client_id),
            ],
            'worker_no' => [
                'nullable', 'string', 'max:50', 'required_if:client_type,staff',
                Rule::unique('clients', 'worker_no')->ignore($appointment->client_id),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'matrix_no.required_if' => 'Please fill in No. Matrik for student client.',
            'matrix_no.unique' => 'A client with this matric number already exists.',
            'worker_no.required_if' => 'Please fill in No. Pekerja for staff client.',
            'worker_no.unique' => 'A client with this worker number already exists.',
            'reference_no.unique' => 'This reference number is already in use.',
        ];
    }
}
