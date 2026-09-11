<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmotionLog extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['client_id', 'score', 'mood_label', 'note', 'logged_at'];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'logged_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
