<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\CounsellorType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Counsellor extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'ppsi_no', 'worker_no', 'name', 'counsellor_type', 'organization',
        'location_id', 'status', 'start_date', 'end_date', 'email', 'phone', 'specialization',
    ];

    protected function casts(): array
    {
        return [
            'counsellor_type' => CounsellorType::class,
            'status' => AccountStatus::class,
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(CounsellingLocation::class, 'location_id');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(AppointmentSlot::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function riskFlags(): HasMany
    {
        return $this->hasMany(RiskFlag::class, 'assigned_counsellor_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(CounsellorTask::class);
    }
}
