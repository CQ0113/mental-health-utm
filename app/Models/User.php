<?php

namespace App\Models;

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasUuids, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'role',
        'status',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'role' => UserRole::class,
            'status' => AccountStatus::class,
        ];
    }

    /**
     * The schema stores the hashed password in `password_hash`, not
     * Laravel's default `password` column, so point the auth guard at it.
     * `Auth::attempt(['email' => ..., 'password' => ...])` still works
     * unchanged because it only ever reads via this accessor — write
     * `password_hash` directly (e.g. `Hash::make(...)`) when creating users.
     */
    public function getAuthPassword(): ?string
    {
        return $this->password_hash;
    }

    public function client(): HasOne
    {
        return $this->hasOne(Client::class);
    }

    public function counsellor(): HasOne
    {
        return $this->hasOne(Counsellor::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isClient(): bool
    {
        return $this->role === UserRole::Client;
    }

    public function isCounsellor(): bool
    {
        return $this->role === UserRole::Counselor;
    }
}
