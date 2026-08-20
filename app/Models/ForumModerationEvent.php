<?php

namespace App\Models;

use App\Enums\ForumPostStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumModerationEvent extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['post_id', 'moderator_user_id', 'action', 'previous_status', 'next_status', 'reason'];

    protected function casts(): array
    {
        return [
            'previous_status' => ForumPostStatus::class,
            'next_status' => ForumPostStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderator_user_id');
    }
}
