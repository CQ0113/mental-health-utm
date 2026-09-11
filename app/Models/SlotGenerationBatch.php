<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SlotGenerationBatch extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'created_at', 'created_by_user_id', 'generation_method', 'start_date', 'end_date',
        'slot_template', 'replace_existing', 'total_rows', 'valid_rows', 'skipped_rows', 'summary',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'replace_existing' => 'boolean',
            'total_rows' => 'integer',
            'valid_rows' => 'integer',
            'skipped_rows' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(AppointmentSlot::class, 'batch_id');
    }
}
