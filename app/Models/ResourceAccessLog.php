<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ResourceAccessLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['resource_id', 'client_id', 'accessed_at'];

    protected function casts(): array
    {
        return ['accessed_at' => 'datetime'];
    }

    public function resource(): BelongsTo
    {
        return $this->belongsTo(ResourceLibraryItem::class, 'resource_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
