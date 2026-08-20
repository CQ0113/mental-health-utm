<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\CounsellingLocation;

/**
 * AS03 1.2 — "the system generates a new session reference number" for
 * client-submitted bookings. Format: {LOCATION-PREFIX}/{YEAR}/{5-digit-seq},
 * sequence scoped per location per year.
 */
class AppointmentReferenceNumber
{
    public static function generate(?CounsellingLocation $location): string
    {
        $prefix = self::prefixFor($location);
        $year = now()->year;

        $count = Appointment::where('reference_no', 'like', "{$prefix}/{$year}/%")->count();

        do {
            $count++;
            $candidate = sprintf('%s/%d/%05d', $prefix, $year, $count);
        } while (Appointment::where('reference_no', $candidate)->exists());

        return $candidate;
    }

    private static function prefixFor(?CounsellingLocation $location): string
    {
        $letters = preg_replace('/[^A-Za-z]/', '', $location?->code ?? '');

        if (! $letters) {
            return 'APT';
        }

        return strtoupper(substr($letters, 0, 3));
    }
}
