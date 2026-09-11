<?php

namespace App\Models;

use App\Enums\RiskFlagStatus;
use App\Enums\RiskLevel;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RiskFlag extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'client_id', 'assigned_counsellor_id', 'source', 'source_ref_id', 'severity',
        'message', 'status', 'flagged_at', 'reviewed_by_user_id', 'review_note', 'reviewed_at', 'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'severity' => RiskLevel::class,
            'status' => RiskFlagStatus::class,
            'flagged_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function assignedCounsellor(): BelongsTo
    {
        return $this->belongsTo(Counsellor::class, 'assigned_counsellor_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(CounsellorTask::class);
    }
}
