<?php

namespace App\Models;

use App\Enums\SessionMode;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AttendanceSession extends Model
{
    use HasUuids;

    protected $fillable = [
        'appointment_id', 'session_mode', 'qr_token_hash',
        'qr_generated_by_user_id', 'qr_generated_at', 'qr_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'session_mode' => SessionMode::class,
            'qr_generated_at' => 'datetime',
            'qr_expires_at' => 'datetime',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function qrGeneratedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'qr_generated_by_user_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(AttendanceParticipant::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(AttendanceEvent::class);
    }
}
