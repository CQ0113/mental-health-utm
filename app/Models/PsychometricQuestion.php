<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PsychometricQuestion extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['test_id', 'position', 'prompt_ms', 'prompt_en'];

    protected function casts(): array
    {
        return ['position' => 'integer'];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(PsychometricTest::class, 'test_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PsychometricAnswer::class, 'question_id');
    }
}
