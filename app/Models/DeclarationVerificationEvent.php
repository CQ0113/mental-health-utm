<?php

namespace App\Models;

use App\Enums\DeclarationStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeclarationVerificationEvent extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['declaration_id', 'verifier_user_id', 'action', 'note'];

    protected function casts(): array
    {
        return [
            'action' => DeclarationStatus::class,
            'created_at' => 'datetime',
        ];
    }

    public function declaration(): BelongsTo
    {
        return $this->belongsTo(Declaration::class);
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifier_user_id');
    }
}
