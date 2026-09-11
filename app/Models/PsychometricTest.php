<?php

namespace App\Models;

use App\Enums\ContentVisibility;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PsychometricTest extends Model
{
    use HasUuids;

    protected $fillable = [
        'code', 'title_ms', 'title_en', 'description_ms', 'description_en', 'category',
        'estimated_minutes', 'source_pdf_file_name', 'uploaded_by_user_id', 'visibility',
    ];

    protected function casts(): array
    {
        return [
            'estimated_minutes' => 'integer',
            'visibility' => ContentVisibility::class,
        ];
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function questions(): HasMany
    {
        return $this->hasMany(PsychometricQuestion::class, 'test_id')->orderBy('position');
    }

    public function options(): HasMany
    {
        return $this->hasMany(PsychometricOption::class, 'test_id')->orderBy('value');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(PsychometricSubmission::class, 'test_id');
    }
}
