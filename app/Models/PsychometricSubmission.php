<?php

namespace App\Models;

use App\Enums\RiskLevel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PsychometricSubmission extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'test_id', 'client_id', 'submitted_at', 'total_score', 'max_score', 'score_percent',
        'risk_level', 'ai_summary_ms', 'ai_summary_en', 'ai_recommendation_ms', 'ai_recommendation_en',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'total_score' => 'integer',
            'max_score' => 'integer',
            'score_percent' => 'integer',
            'risk_level' => RiskLevel::class,
        ];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(PsychometricTest::class, 'test_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(PsychometricAnswer::class, 'submission_id');
    }
}
