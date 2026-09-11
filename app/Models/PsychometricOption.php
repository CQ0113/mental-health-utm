<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PsychometricOption extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['test_id', 'value', 'label_ms', 'label_en'];

    protected function casts(): array
    {
        return ['value' => 'integer'];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(PsychometricTest::class, 'test_id');
    }
}
