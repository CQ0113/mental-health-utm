<?php

namespace App\Models;

use App\Enums\DeclarationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Declaration extends Model
{
    use HasUuids;

    protected $fillable = [
        'client_id', 'appointment_id', 'declaration_text', 'is_checked', 'status',
        'submitted_at', 'verified_by_user_id', 'verified_at', 'correction_note',
    ];

    protected function casts(): array
    {
        return [
            'is_checked' => 'boolean',
            'status' => DeclarationStatus::class,
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function verificationEvents(): HasMany
    {
        return $this->hasMany(DeclarationVerificationEvent::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(EmailNotification::class);
    }
}
