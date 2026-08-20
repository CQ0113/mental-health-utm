<?php

namespace App\Models;

use App\Enums\ContentVisibility;
use App\Enums\ResourceCategory;
use App\Enums\ResourceType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResourceLibraryItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'title_ms', 'title_en', 'description_ms', 'description_en', 'category',
        'resource_type', 'duration_label', 'url', 'visibility', 'uploaded_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'category' => ResourceCategory::class,
            'resource_type' => ResourceType::class,
            'visibility' => ContentVisibility::class,
        ];
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by_user_id');
    }

    public function accessLogs(): HasMany
    {
        return $this->hasMany(ResourceAccessLog::class, 'resource_id');
    }
}
