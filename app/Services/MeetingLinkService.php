<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Per the thesis (§2.6.4), online appointments get a Daily.co WebRTC room,
 * whose webhooks also drive TA04's auto-attendance in Phase 4.
 *
 * No Daily.co account/API key has been provisioned yet (docs/implementation-plan.md
 * §5.2), so this only returns a deterministic placeholder link for now — real
 * appointments still get a working, appointment-specific URL end to end, it's
 * just not backed by an actual WebRTC room until DAILY_CO_API_KEY is set.
 * Swapping in the real API call happens inside this one class only.
 */
class MeetingLinkService
{
    public function createRoomFor(Appointment $appointment): string
    {
        $apiKey = config('services.daily_co.api_key');

        if (! $apiKey) {
            Log::info('MeetingLinkService: DAILY_CO_API_KEY not configured, issuing placeholder link.', [
                'appointment_id' => $appointment->id,
            ]);

            return 'https://meet.psycare.local/'.Str::slug($appointment->reference_no ?? $appointment->id);
        }

        // TODO: real Daily.co room creation (POST https://api.daily.co/v1/rooms)
        // once an API key is provisioned. Keep the same return contract (a URL
        // string) so no caller needs to change when this is wired up for real.
        return 'https://meet.psycare.local/'.Str::slug($appointment->reference_no ?? $appointment->id);
    }
}
