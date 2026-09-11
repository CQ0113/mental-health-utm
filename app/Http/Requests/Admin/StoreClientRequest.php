<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Required fields match the current UI's client-side check (UM03 EF1).
     * matrix_no/worker_no uniqueness implements UM03 EF2 (duplicate
     * profile information) for the identifiers this form actually collects.
     */
    public function rules(): array
    {
        return [
            'reference_no' => ['required', 'string', 'max:100', 'unique:appointments,reference_no'],
            'location_id' => ['required', 'uuid', 'exists:counselling_locations,id'],
            'counsellor_id' => ['nullable', 'uuid', 'exists:counsellors,id'],
            'appointment_need' => ['nullable', 'string', 'max:2000'],
            'attended_before' => ['required', 'boolean'],
            'client_type' => ['required', 'in:student,staff,alumni'],
            'full_name' => ['required', 'string', 'max:255'],
            'faculty' => ['required', 'string', 'max:255'],
            'matrix_no' => [
                'nullable', 'string', 'max:50',
                'required_if:client_type,student',
                Rule::unique('clients', 'matrix_no'),
            ],
            'worker_no' => [
                'nullable', 'string', 'max:50',
                'required_if:client_type,staff',
                Rule::unique('clients', 'worker_no'),
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
