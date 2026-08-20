<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('guest can load the login page', function () {
    $this->get('/login')->assertOk();
});

test('guest is redirected to login when visiting a protected portal', function () {
    $this->get('/admin/dashboard')->assertRedirect('/login');
    $this->get('/psycare/dashboard')->assertRedirect('/login');
    $this->get('/counsellor/dashboard')->assertRedirect('/login');
});

test('a user can log in with email and password and is redirected by role', function () {
    User::factory()->role(UserRole::Client)->create([
        'email' => 'client@example.test',
        'password_hash' => Hash::make('secret123'),
    ]);

    $response = $this->post('/login', [
        'email' => 'client@example.test',
        'password' => 'secret123',
    ]);

    $response->assertRedirect('/psycare');
    $this->assertAuthenticated();
});

test('wrong password does not authenticate', function () {
    User::factory()->role(UserRole::Client)->create([
        'email' => 'client@example.test',
        'password_hash' => Hash::make('secret123'),
    ]);

    $response = $this->post('/login', [
        'email' => 'client@example.test',
        'password' => 'wrong-password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

test('quick login logs in as the seeded demo account for the given role', function () {
    User::factory()->role(UserRole::Admin)->create(['email' => 'admin@psycare.test']);
    User::factory()->role(UserRole::Counselor)->create(['email' => 'counsellor@psycare.test']);
    User::factory()->role(UserRole::Client)->create(['email' => 'client@psycare.test']);

    $response = $this->post('/login/quick', ['role' => 'counselor']);

    $response->assertRedirect('/counsellor');
    $this->assertAuthenticatedAs(User::where('email', 'counsellor@psycare.test')->first());
});

test('a client cannot access the admin portal', function () {
    $client = User::factory()->role(UserRole::Client)->create();

    $this->actingAs($client)
        ->get('/admin/dashboard')
        ->assertForbidden();
});

test('an admin can access the admin portal', function () {
    $admin = User::factory()->role(UserRole::Admin)->create();

    $this->actingAs($admin)
        ->get('/admin/dashboard')
        ->assertOk();
});

test('logout ends the session', function () {
    $user = User::factory()->role(UserRole::Client)->create();

    $this->actingAs($user)->post('/logout')->assertRedirect('/login');
    $this->assertGuest();
});
