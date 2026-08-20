<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCounsellorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Required fields match the current UI's client-side check (UM01 EF1).
     * Uniqueness rules implement UM01 EF2 (duplicate PPsi/worker/email).
     */
    public function rules(): array
    {
        $counsellorId = $this->route('counsellor')?->id;

        return [
            'counsellor_type' => ['required', 'in:staff,trainee'],
            'worker_no' => [
                'nullable', 'string', 'max:50',
                Rule::unique('counsellors', 'worker_no')->ignore($counsellorId),
            ],
            'ppsi_no' => [
                'nullable', 'string', 'max:50',
                Rule::unique('counsellors', 'ppsi_no')->ignore($counsellorId),
            ],
            'name' => ['required', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable', 'email', 'max:255',
                Rule::unique('counsellors', 'email')->ignore($counsellorId),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'location_id' => ['required', 'uuid', 'exists:counselling_locations,id'],
            'status' => ['required', 'in:active,inactive,suspended'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function messages(): array
    {
        return [
            'worker_no.unique' => 'A counsellor with this worker number already exists.',
            'ppsi_no.unique' => 'A counsellor with this PPsi number already exists.',
            'email.unique' => 'A counsellor with this email already exists.',
        ];
    }
}
