<?php

namespace App\Models;

use App\Enums\SessionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Composite-key join table (slot_id, session_type). Eloquent does not
 * support composite primary keys natively, so this model is used mainly
 * for querying/inserting rather than find()-by-key access.
 */
class AppointmentSlotSessionType extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = null;

    protected $fillable = ['slot_id', 'session_type'];

    protected function casts(): array
    {
        return ['session_type' => SessionType::class];
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(AppointmentSlot::class, 'slot_id');
    }
}
