<?php

namespace App\Models;

use App\Enums\AttendanceMethod;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceEvent extends Model
{
    use HasUuids;

    public $timestamps = false;

    protected $fillable = ['attendance_session_id', 'client_id', 'user_id', 'event_type', 'method', 'metadata'];

    protected function casts(): array
    {
        return [
            'method' => AttendanceMethod::class,
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AttendanceSession::class, 'attendance_session_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
