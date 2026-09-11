<?php

namespace App\Models;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CounsellorTask extends Model
{
    use HasUuids;

    protected $fillable = [
        'counsellor_id', 'client_id', 'risk_flag_id', 'title', 'priority', 'due_at', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'priority' => TaskPriority::class,
            'status' => TaskStatus::class,
            'due_at' => 'datetime',
        ];
    }

    public function counsellor(): BelongsTo
    {
        return $this->belongsTo(Counsellor::class);
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function riskFlag(): BelongsTo
    {
        return $this->belongsTo(RiskFlag::class);
    }
}
