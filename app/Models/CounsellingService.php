<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\ServiceSessionMode;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CounsellingService extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'name', 'duration_minutes', 'location_id', 'session_mode', 'status',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'session_mode' => ServiceSessionMode::class,
            'status' => AccountStatus::class,
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(CounsellingLocation::class, 'location_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'service_id');
    }
}
