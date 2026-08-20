<?php

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\User;

function asAdmin(): User
{
    return User::factory()->role(UserRole::Admin)->create();
}

function seedLocation(): CounsellingLocation
{
    return CounsellingLocation::create([
        'code' => 'JB-'.uniqid(),
        'name' => 'PUSAT KAUNSELING (JB)',
        'is_active' => true,
    ]);
}

// --- UM01 Onboard Counselor -------------------------------------------

test('admin can onboard a new counsellor and a linked user account is created', function () {
    $location = seedLocation();

    $response = $this->actingAs(asAdmin())->post('/admin/counsellor-ppsi', [
        'counsellor_type' => 'staff',
        'worker_no' => 'W-9001',
        'name' => 'Dr. Test Counsellor',
        'organization' => 'UTM',
        'email' => 'test.counsellor@utm.my',
        'phone' => '0123456789',
        'location_id' => $location->id,
        'status' => 'active',
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);

    $response->assertSessionHasNoErrors();
    $response->assertRedirect();

    $this->assertDatabaseHas('counsellors', ['worker_no' => 'W-9001', 'name' => 'Dr. Test Counsellor']);
    $this->assertDatabaseHas('users', ['email' => 'test.counsellor@utm.my', 'role' => 'counselor']);
});

test('onboarding a counsellor requires the client-side required fields', function () {
    $response = $this->actingAs(asAdmin())->post('/admin/counsellor-ppsi', [
        'counsellor_type' => 'staff',
        'name' => '',
    ]);

    $response->assertSessionHasErrors(['name', 'location_id', 'start_date', 'end_date']);
});

test('onboarding rejects a duplicate worker number (UM01 EF2)', function () {
    $location = seedLocation();

    Counsellor::create([
        'worker_no' => 'W-DUP',
        'name' => 'Existing Counsellor',
        'counsellor_type' => 'staff',
        'location_id' => $location->id,
        'status' => 'active',
    ]);

    $response = $this->actingAs(asAdmin())->post('/admin/counsellor-ppsi', [
        'counsellor_type' => 'staff',
        'worker_no' => 'W-DUP',
        'name' => 'New Counsellor',
        'location_id' => $location->id,
        'status' => 'active',
        'start_date' => '2026-01-01',
        'end_date' => '2026-12-31',
    ]);

    $response->assertSessionHasErrors('worker_no');
});

test('a client cannot onboard a counsellor', function () {
    $client = User::factory()->role(UserRole::Client)->create();

    $this->actingAs($client)
        ->get('/admin/counsellor-ppsi')
        ->assertForbidden();
});

// --- UM03 Manage User Profile (Admin: Client Information) --------------

test('admin can register a new client information record, creating both a client and an appointment', function () {
    $location = seedLocation();

    $response = $this->actingAs(asAdmin())->post('/admin/client-information', [
        'reference_no' => 'WJB/2026/00001',
        'location_id' => $location->id,
        'counsellor_id' => null,
        'appointment_need' => 'Stress management',
        'attended_before' => false,
        'client_type' => 'student',
        'full_name' => 'Test Student',
        'faculty' => 'Fakulti Komputeran',
        'matrix_no' => 'A26CS0001',
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('clients', ['full_name' => 'Test Student', 'matrix_no' => 'A26CS0001']);
    $this->assertDatabaseHas('appointments', ['reference_no' => 'WJB/2026/00001', 'status' => 'pending']);
});

test('registering a client requires matric number for student type (UM03 EF1)', function () {
    $location = seedLocation();

    $response = $this->actingAs(asAdmin())->post('/admin/client-information', [
        'reference_no' => 'WJB/2026/00002',
        'location_id' => $location->id,
        'attended_before' => false,
        'client_type' => 'student',
        'full_name' => 'No Matric Student',
        'faculty' => 'Fakulti Komputeran',
    ]);

    $response->assertSessionHasErrors('matrix_no');
});

test('registering a client rejects a duplicate matric number (UM03 EF2)', function () {
    $location = seedLocation();

    Client::create([
        'full_name' => 'Existing Client',
        'client_type' => 'student',
        'matrix_no' => 'A26CS9999',
        'faculty' => 'Fakulti Komputeran',
    ]);

    $response = $this->actingAs(asAdmin())->post('/admin/client-information', [
        'reference_no' => 'WJB/2026/00003',
        'location_id' => $location->id,
        'attended_before' => false,
        'client_type' => 'student',
        'full_name' => 'Another Client',
        'faculty' => 'Fakulti Komputeran',
        'matrix_no' => 'A26CS9999',
    ]);

    $response->assertSessionHasErrors('matrix_no');
});

test('admin can update an existing client information record', function () {
    $location = seedLocation();
    $client = Client::create([
        'full_name' => 'Original Name',
        'client_type' => 'student',
        'matrix_no' => 'A26CS0010',
        'faculty' => 'Fakulti Komputeran',
    ]);
    $appointment = Appointment::create([
        'reference_no' => 'WJB/2026/00010',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'attended_before' => false,
        'status' => 'pending',
    ]);

    $response = $this->actingAs(asAdmin())->put("/admin/client-information/{$appointment->id}", [
        'reference_no' => 'WJB/2026/00010',
        'location_id' => $location->id,
        'attended_before' => true,
        'client_type' => 'student',
        'full_name' => 'Updated Name',
        'faculty' => 'Fakulti Komputeran',
        'matrix_no' => 'A26CS0010',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('clients', ['id' => $client->id, 'full_name' => 'Updated Name']);
    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'attended_before' => true]);
});

test('admin can delete a client information record without deleting the client profile', function () {
    $location = seedLocation();
    $client = Client::create([
        'full_name' => 'To Delete Case',
        'client_type' => 'student',
        'matrix_no' => 'A26CS0020',
        'faculty' => 'Fakulti Komputeran',
    ]);
    $appointment = Appointment::create([
        'reference_no' => 'WJB/2026/00020',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'attended_before' => false,
        'status' => 'pending',
    ]);

    $this->actingAs(asAdmin())->delete("/admin/client-information/{$appointment->id}")
        ->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('appointments', ['id' => $appointment->id]);
    $this->assertDatabaseHas('clients', ['id' => $client->id]);
});

test('a counselor cannot access the admin client information page', function () {
    $counselor = User::factory()->role(UserRole::Counselor)->create();

    $this->actingAs($counselor)
        ->get('/admin/client-information')
        ->assertForbidden();
});

// --- UM03 Manage User Profile (Client: My Account) ----------------------

test('a client sees their own real profile data on My Account', function () {
    $user = User::factory()->role(UserRole::Client)->create();
    Client::create([
        'user_id' => $user->id,
        'full_name' => 'Real Client Name',
        'client_type' => 'student',
        'matrix_no' => 'A26CS0030',
        'faculty' => 'Fakulti Komputeran',
        'email' => 'real.client@utm.my',
    ]);

    $response = $this->actingAs($user)->get('/psycare/perkhidmatan');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->component('psycare/perkhidmatan')
        ->where('myClientProfile.fullName', 'Real Client Name')
        ->where('myClientProfile.matrixNo', 'A26CS0030')
    );
});
