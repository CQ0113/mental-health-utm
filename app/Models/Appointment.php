<?php

namespace App\Models;

use App\Enums\AppointmentStatus;
use App\Enums\AppointmentType;
use App\Enums\SessionMode;
use App\Enums\SessionType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appointment extends Model
{
    use HasUuids;

    protected $fillable = [
        'reference_no', 'client_id', 'requested_by_user_id', 'previous_appointment_id',
        'appointment_type', 'session_type', 'session_mode', 'service_id', 'location_id',
        'slot_id', 'counsellor_id', 'preferred_date', 'appointment_need', 'issue_summary',
        'attachment_description', 'applicant_note', 'attended_before', 'status',
        'admin_review_by_user_id', 'admin_review_note', 'admin_reviewed_at',
        'counsellor_review_by_user_id', 'counsellor_review_note', 'counsellor_reviewed_at',
        'meeting_link', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'appointment_type' => AppointmentType::class,
            'session_type' => SessionType::class,
            'session_mode' => SessionMode::class,
            'status' => AppointmentStatus::class,
            'preferred_date' => 'date',
            'attended_before' => 'boolean',
            'admin_reviewed_at' => 'datetime',
            'counsellor_reviewed_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    public function previousAppointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class, 'previous_appointment_id');
    }

    public function followUpAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'previous_appointment_id');
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(CounsellingService::class, 'service_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(CounsellingLocation::class, 'location_id');
    }

    public function slot(): BelongsTo
    {
        return $this->belongsTo(AppointmentSlot::class, 'slot_id');
    }

    public function counsellor(): BelongsTo
    {
        return $this->belongsTo(Counsellor::class);
    }

    public function adminReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_review_by_user_id');
    }

    public function counsellorReviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counsellor_review_by_user_id');
    }

    public function participants(): HasMany
    {
        return $this->hasMany(AppointmentParticipant::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(AppointmentAttachment::class);
    }

    public function declarations(): HasMany
    {
        return $this->hasMany(Declaration::class);
    }

    public function attendanceSession(): HasOne
    {
        return $this->hasOne(AttendanceSession::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(EmailNotification::class);
    }
}
