<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ForumSupport extends Model
{
    public $incrementing = false;

    protected $primaryKey = null;

    const UPDATED_AT = null;

    protected $fillable = ['post_id', 'client_id'];

    public function post(): BelongsTo
    {
        return $this->belongsTo(ForumPost::class, 'post_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
