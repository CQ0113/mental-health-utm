<?php

namespace App\Services;

use App\Enums\DeclarationStatus;
use App\Models\Client;
use App\Models\Declaration;
use App\Models\DeclarationVerificationEvent;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * DC01–DC03 Client Information Declaration.
 *
 * The declaration is profile-level (user decision, 2026-09-11): a client
 * declares once that their Client Information Form is true, so
 * `declarations.appointment_id` stays null. The column exists for a
 * per-appointment variant that isn't built.
 *
 * Verification (DC03) is shared by Admin\DeclarationController and
 * Counsellor\DeclarationController — both roles are listed as verifiers in
 * the use case, and keeping the transition logic here means the two can't
 * drift apart.
 */
class DeclarationService
{
    /**
     * The client's profile-level declaration, if they have one.
     */
    public function forClient(Client $client): ?Declaration
    {
        return Declaration::with('verifiedBy')
            ->where('client_id', $client->id)
            ->whereNull('appointment_id')
            ->latest('created_at')
            ->first();
    }

    /**
     * DC02 AF1 — Client submits the declaration. Re-submitting after a
     * correction request updates the same row (verification events keep the
     * history) rather than piling up near-duplicate declarations.
     */
    public function submit(Client $client, bool $isChecked): Declaration
    {
        // EF1 — "asking the Client to tick the declaration checkbox before
        // submitting."
        if (! $isChecked) {
            throw ValidationException::withMessages([
                'is_checked' => 'Please tick the declaration checkbox before submitting.',
            ]);
        }

        $declaration = $this->forClient($client);

        if ($declaration && $declaration->status === DeclarationStatus::Verified) {
            throw ValidationException::withMessages([
                'is_checked' => 'This declaration has already been verified and cannot be resubmitted.',
            ]);
        }

        $attributes = [
            'declaration_text' => config('psycare.declaration.text'),
            'is_checked' => true,
            'status' => DeclarationStatus::Submitted,
            'submitted_at' => now(),
            // A resubmission clears the previous review outcome — it is
            // waiting on a fresh verification again.
            'verified_by_user_id' => null,
            'verified_at' => null,
            'correction_note' => null,
        ];

        if ($declaration) {
            $declaration->update($attributes);

            return $declaration->refresh();
        }

        return Declaration::create([
            'client_id' => $client->id,
            'appointment_id' => null,
            ...$attributes,
        ]);
    }

    /**
     * DC03 AF1 — Admin/Counsellor verifies a submitted declaration.
     */
    public function verify(Declaration $declaration, User $verifier, ?string $note = null): Declaration
    {
        // EF2 — "the declaration has already been verified."
        if ($declaration->status === DeclarationStatus::Verified) {
            throw ValidationException::withMessages([
                'declaration' => 'This declaration has already been verified.',
            ]);
        }

        // EF1 — "cannot be verified until required information is complete."
        if (! $declaration->is_checked || $declaration->submitted_at === null) {
            throw ValidationException::withMessages([
                'declaration' => 'This declaration cannot be verified until the client has submitted it.',
            ]);
        }

        return $this->transitionTo($declaration, DeclarationStatus::Verified, $verifier, $note);
    }

    /**
     * DC03 AF2 — Admin/Counsellor sends the declaration back for correction.
     */
    public function requestCorrection(Declaration $declaration, User $verifier, string $note): Declaration
    {
        if ($declaration->submitted_at === null) {
            throw ValidationException::withMessages([
                'declaration' => 'This declaration has not been submitted yet.',
            ]);
        }

        return $this->transitionTo($declaration, DeclarationStatus::CorrectionRequired, $verifier, $note);
    }

    private function transitionTo(
        Declaration $declaration,
        DeclarationStatus $status,
        User $verifier,
        ?string $note,
    ): Declaration {
        return DB::transaction(function () use ($declaration, $status, $verifier, $note) {
            $declaration->update([
                'status' => $status,
                'verified_by_user_id' => $verifier->id,
                'verified_at' => now(),
                'correction_note' => $status === DeclarationStatus::CorrectionRequired ? $note : null,
            ]);

            DeclarationVerificationEvent::create([
                'created_at' => now(),
                'declaration_id' => $declaration->id,
                'verifier_user_id' => $verifier->id,
                'action' => $status,
                'note' => $note,
            ]);

            return $declaration->refresh();
        });
    }

    /**
     * Shape a declaration for the frontend. Null when the client has never
     * submitted one.
     */
    public function present(?Declaration $declaration): ?array
    {
        if (! $declaration) {
            return null;
        }

        return [
            'id' => $declaration->id,
            'declarationText' => $declaration->declaration_text,
            'isChecked' => $declaration->is_checked,
            'status' => $declaration->status->value,
            'submittedAt' => $declaration->submitted_at?->toDateTimeString(),
            'verifiedAt' => $declaration->verified_at?->toDateTimeString(),
            'verifiedByName' => $declaration->verifiedBy?->name,
            'correctionNote' => $declaration->correction_note,
        ];
    }
}
