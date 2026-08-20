<?php

namespace App\Models;

use App\Enums\ClientType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'full_name', 'preferred_name', 'client_type', 'national_id',
        'email', 'phone', 'current_address', 'faculty', 'program', 'matrix_no',
        'student_no', 'worker_no', 'marital_status', 'dependent_count',
        'treatment_history', 'current_medications', 'profile_locked',
    ];

    protected function casts(): array
    {
        return [
            'client_type' => ClientType::class,
            'dependent_count' => 'integer',
            'profile_locked' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function appointmentParticipants(): HasMany
    {
        return $this->hasMany(AppointmentParticipant::class);
    }

    public function declarations(): HasMany
    {
        return $this->hasMany(Declaration::class);
    }

    public function termsAcceptances(): HasMany
    {
        return $this->hasMany(TermsAcceptance::class);
    }

    public function attendanceParticipants(): HasMany
    {
        return $this->hasMany(AttendanceParticipant::class);
    }

    public function emotionLogs(): HasMany
    {
        return $this->hasMany(EmotionLog::class);
    }

    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    public function riskFlags(): HasMany
    {
        return $this->hasMany(RiskFlag::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(CounsellorTask::class);
    }

    public function resourceAccessLogs(): HasMany
    {
        return $this->hasMany(ResourceAccessLog::class);
    }

    public function forumPosts(): HasMany
    {
        return $this->hasMany(ForumPost::class, 'author_client_id');
    }

    public function forumSupports(): HasMany
    {
        return $this->hasMany(ForumSupport::class);
    }

    public function psychometricSubmissions(): HasMany
    {
        return $this->hasMany(PsychometricSubmission::class);
    }
}
