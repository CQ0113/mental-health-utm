<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AppointmentSlot extends Model
{
    use HasUuids;

    protected $fillable = [
        'slot_date', 'start_time', 'end_time', 'label', 'counsellor_id', 'location_id',
        'batch_id', 'capacity', 'is_active', 'created_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'slot_date' => 'date',
            'capacity' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function counsellor(): BelongsTo
    {
        return $this->belongsTo(Counsellor::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(CounsellingLocation::class, 'location_id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(SlotGenerationBatch::class, 'batch_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function sessionTypes(): HasMany
    {
        return $this->hasMany(AppointmentSlotSessionType::class, 'slot_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'slot_id');
    }
}
