<?php

namespace App\Models;

use App\Enums\ForumPostStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ForumPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'author_client_id', 'category_id', 'title', 'content', 'safety_score', 'moderation_reason', 'status',
    ];

    protected function casts(): array
    {
        return [
            'safety_score' => 'integer',
            'status' => ForumPostStatus::class,
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'author_client_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ForumCategory::class, 'category_id');
    }

    public function supports(): HasMany
    {
        return $this->hasMany(ForumSupport::class, 'post_id');
    }

    public function moderationEvents(): HasMany
    {
        return $this->hasMany(ForumModerationEvent::class, 'post_id');
    }
}
