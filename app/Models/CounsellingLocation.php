<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CounsellingLocation extends Model
{
    use HasUuids;

    protected $fillable = ['code', 'name', 'campus', 'address', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function counsellors(): HasMany
    {
        return $this->hasMany(Counsellor::class, 'location_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(CounsellingService::class, 'location_id');
    }

    public function slots(): HasMany
    {
        return $this->hasMany(AppointmentSlot::class, 'location_id');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'location_id');
    }
}
