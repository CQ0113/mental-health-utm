<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PsychometricAnswer extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['submission_id', 'question_id', 'option_value'];

    protected function casts(): array
    {
        return ['option_value' => 'integer'];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(PsychometricSubmission::class, 'submission_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(PsychometricQuestion::class, 'question_id');
    }
}
