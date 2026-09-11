<?php

namespace App\Services;

use App\Models\Client;
use App\Models\TermsAcceptance;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * The blocking first-use Terms and Conditions pop-up.
 *
 * Deliberately separate from the Client Information Declaration
 * (App\Services\DeclarationService): this is consent to use the system,
 * that one is the client swearing their profile details are true. The
 * schema keeps them in different tables for the same reason.
 */
class TermsAcceptanceService
{
    public function currentVersion(): string
    {
        return (string) config('psycare.terms.version');
    }

    /**
     * Has this client accepted the version currently in force? A bumped
     * version means everyone is asked again, while their old acceptance
     * stays on record.
     */
    public function hasAccepted(Client $client): bool
    {
        return TermsAcceptance::where('client_id', $client->id)
            ->where('terms_version', $this->currentVersion())
            ->where('accepted', true)
            ->exists();
    }

    /**
     * Record acceptance. `UNIQUE (client_id, terms_version)` means a repeat
     * submission updates the existing row rather than erroring.
     */
    public function accept(Client $client, User $user, Request $request): TermsAcceptance
    {
        return TermsAcceptance::updateOrCreate(
            [
                'client_id' => $client->id,
                'terms_version' => $this->currentVersion(),
            ],
            [
                'user_id' => $user->id,
                'accepted' => true,
                'accepted_at' => now(),
                'ip_address' => $request->ip(),
                'user_agent' => substr((string) $request->userAgent(), 0, 500),
            ],
        );
    }

    /**
     * Shape for the shared Inertia prop the client layout reads to decide
     * whether to block the portal behind the pop-up.
     */
    public function presentFor(?Client $client): ?array
    {
        if (! $client) {
            return null;
        }

        $acceptance = TermsAcceptance::where('client_id', $client->id)
            ->where('terms_version', $this->currentVersion())
            ->first();

        return [
            'version' => $this->currentVersion(),
            'accepted' => (bool) $acceptance?->accepted,
            'acceptedAt' => $acceptance?->accepted_at?->toDateTimeString(),
            'clientName' => $client->full_name,
            'clientIdentifier' => $client->matrix_no ?? $client->worker_no ?? $client->national_id,
        ];
    }
}
