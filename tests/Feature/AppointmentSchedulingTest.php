<?php

use App\Enums\AppointmentStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\AppointmentSlot;
use App\Models\AppointmentSlotSessionType;
use App\Models\Client;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

function asAppointmentAdmin(): User
{
    return User::factory()->role(UserRole::Admin)->create();
}

function seedAppointmentLocation(): CounsellingLocation
{
    return CounsellingLocation::create([
        'code' => 'WJB-'.uniqid(),
        'name' => 'PUSAT KAUNSELING (JB)',
        'is_active' => true,
    ]);
}

function seedAppointmentCounsellor(CounsellingLocation $location): Counsellor
{
    return Counsellor::create([
        'worker_no' => 'W-'.uniqid(),
        'name' => 'Test Counsellor',
        'counsellor_type' => 'staff',
        'location_id' => $location->id,
        'status' => 'active',
    ]);
}

function seedBookableSlot(CounsellingLocation $location, Counsellor $counsellor, array $overrides = []): AppointmentSlot
{
    $slot = AppointmentSlot::create(array_merge([
        'slot_date' => now()->addDays(3)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'label' => '09:00 AM - 10:00 AM',
        'counsellor_id' => $counsellor->id,
        'location_id' => $location->id,
        'capacity' => 1,
        'is_active' => true,
    ], $overrides));

    AppointmentSlotSessionType::create(['slot_id' => $slot->id, 'session_type' => 'physical']);
    AppointmentSlotSessionType::create(['slot_id' => $slot->id, 'session_type' => 'online']);

    return $slot;
}

function asAppointmentClient(): array
{
    $user = User::factory()->role(UserRole::Client)->create();
    $client = Client::create([
        'user_id' => $user->id,
        'full_name' => 'Test Client',
        'client_type' => 'student',
        'matrix_no' => 'A26CS'.uniqid(),
        'faculty' => 'Fakulti Komputeran',
    ]);

    return [$user, $client];
}

// --- AS04/AS05/AS06 Manage Slots ---------------------------------------

test('admin can save new slot changes', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);

    $response = $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => [[
            'slot_date' => now()->addDays(5)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'counsellor_id' => $counsellor->id,
            'location_id' => $location->id,
            'session_types' => ['physical', 'online'],
        ]],
        'deleted_slot_ids' => [],
        'generation_method' => 'manual',
    ]);

    $response->assertSessionHasNoErrors();
    expect(
        AppointmentSlot::whereDate('slot_date', now()->addDays(5)->toDateString())
            ->where('counsellor_id', $counsellor->id)
            ->exists()
    )->toBeTrue();
    $this->assertDatabaseHas('slot_generation_batches', ['generation_method' => 'manual']);
});

test('saving overlapping slots for the same counsellor and date is rejected', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    seedBookableSlot($location, $counsellor);

    $response = $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => [[
            'slot_date' => now()->addDays(3)->toDateString(),
            'start_time' => '09:30',
            'end_time' => '10:30',
            'counsellor_id' => $counsellor->id,
            'location_id' => $location->id,
            'session_types' => ['physical'],
        ]],
        'deleted_slot_ids' => [],
    ]);

    $response->assertSessionHasErrors('new_slots.0.start_time');
});

test('saving a slot with a nonexistent counsellor id is rejected', function () {
    $location = seedAppointmentLocation();

    $response = $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => [[
            'slot_date' => now()->addDays(5)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'counsellor_id' => (string) \Illuminate\Support\Str::uuid(),
            'location_id' => $location->id,
            'session_types' => ['physical'],
        ]],
        'deleted_slot_ids' => [],
    ]);

    $response->assertSessionHasErrors('new_slots.0.counsellor_id');
});

test('deleting a nonexistent slot id is rejected', function () {
    $response = $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => [],
        'deleted_slot_ids' => [(string) \Illuminate\Support\Str::uuid()],
    ]);

    $response->assertSessionHasErrors('deleted_slot_ids');
});

test('admin can delete a slot through save slot changes', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor);

    $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => [],
        'deleted_slot_ids' => [$slot->id],
    ])->assertSessionHasNoErrors();

    $this->assertDatabaseMissing('appointment_slots', ['id' => $slot->id]);
});

test('a client cannot manage slots', function () {
    [$user] = asAppointmentClient();

    $this->actingAs($user)->get('/admin/slots')->assertForbidden();
});

test('saving a large batch of slots uses a flat number of queries, not one per slot', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);

    // A realistic AS05 bulk-generate result: ~90 weekdays x 4 slots.
    $newSlots = [];
    foreach (range(1, 90) as $dayOffset) {
        $date = now()->addDays(10 + $dayOffset)->toDateString();
        foreach ([['09:00', '10:00'], ['10:30', '11:30'], ['13:30', '14:30'], ['15:00', '16:00']] as [$start, $end]) {
            $newSlots[] = [
                'slot_date' => $date,
                'start_time' => $start,
                'end_time' => $end,
                'counsellor_id' => $counsellor->id,
                'location_id' => $location->id,
                'session_types' => ['physical', 'online'],
            ];
        }
    }

    DB::enableQueryLog();

    $response = $this->actingAs(asAppointmentAdmin())->post('/admin/slots', [
        'new_slots' => $newSlots,
        'deleted_slot_ids' => [],
        'generation_method' => 'bulk',
    ]);

    $queryCount = count(DB::getQueryLog());
    DB::disableQueryLog();

    $response->assertSessionHasNoErrors();
    expect(AppointmentSlot::where('counsellor_id', $counsellor->id)->count())->toBe(360);
    // Flat and small regardless of the 360 slots saved — the old
    // one-row-at-a-time implementation issued 1000+ queries here and blew
    // past PHP's execution time limit against a remote DB.
    expect($queryCount)->toBeLessThan(20);
});

// --- AS01/AS03 Book Appointment -----------------------------------------

test('client can book a new appointment against an available slot', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor);
    [$user] = asAppointmentClient();

    $response = $this->actingAs($user)->post('/psycare/permohonan', [
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'slot_id' => $slot->id,
        'location_id' => $location->id,
        'appointment_need' => 'Stress management',
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('appointments', [
        'slot_id' => $slot->id,
        'status' => 'pending',
        'session_type' => 'physical',
    ]);
    $appointment = Appointment::where('slot_id', $slot->id)->firstOrFail();
    expect($appointment->reference_no)->not->toBeEmpty();
});

test('booking an online session generates a meeting link', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor);
    [$user] = asAppointmentClient();

    $this->actingAs($user)->post('/psycare/permohonan', [
        'appointment_type' => 'new',
        'session_type' => 'online',
        'slot_id' => $slot->id,
    ])->assertSessionHasNoErrors();

    $appointment = Appointment::where('slot_id', $slot->id)->firstOrFail();
    expect($appointment->meeting_link)->not->toBeNull();
});

test('booking a fully booked slot is rejected (EF2)', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor, ['capacity' => 1]);
    [$firstUser, $firstClient] = asAppointmentClient();
    [$secondUser] = asAppointmentClient();

    Appointment::create([
        'reference_no' => 'WJB/2026/EXIST1',
        'client_id' => $firstClient->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'slot_id' => $slot->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($secondUser)->post('/psycare/permohonan', [
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'slot_id' => $slot->id,
    ]);

    $response->assertSessionHasErrors('slot_id');
});

test('follow-up booking requires the previous appointment to have follow-up status (AS02 EF2)', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor);
    [$user, $client] = asAppointmentClient();

    $previous = Appointment::create([
        'reference_no' => 'WJB/2026/PREV01',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'status' => 'completed',
    ]);

    $response = $this->actingAs($user)->post('/psycare/permohonan', [
        'appointment_type' => 'follow_up',
        'previous_appointment_id' => $previous->id,
        'session_type' => 'physical',
        'slot_id' => $slot->id,
    ]);

    $response->assertSessionHasErrors('previous_appointment_id');
});

test('follow-up booking succeeds when the previous appointment is eligible', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    $slot = seedBookableSlot($location, $counsellor);
    [$user, $client] = asAppointmentClient();

    $previous = Appointment::create([
        'reference_no' => 'WJB/2026/PREV02',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'status' => 'follow_up',
    ]);

    $response = $this->actingAs($user)->post('/psycare/permohonan', [
        'appointment_type' => 'follow_up',
        'previous_appointment_id' => $previous->id,
        'session_type' => 'physical',
        'slot_id' => $slot->id,
    ]);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('appointments', [
        'previous_appointment_id' => $previous->id,
        'appointment_type' => 'follow_up',
    ]);
});

// --- AS07 Verify Appointment ---------------------------------------------

test('admin can move a pending appointment to counsellor review', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    [, $client] = asAppointmentClient();

    $appointment = Appointment::create([
        'reference_no' => 'WJB/2026/REV001',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs(asAppointmentAdmin())
        ->patch("/admin/appointments/{$appointment->id}/review", ['decision' => 'counsellor_reviewing']);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'counsellor_reviewing']);
});

test('counsellor cannot approve an appointment still pending admin review (EF3)', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    [, $client] = asAppointmentClient();
    $counsellorUser = User::factory()->role(UserRole::Counselor)->create();

    $appointment = Appointment::create([
        'reference_no' => 'WJB/2026/REV002',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($counsellorUser)
        ->patch("/counsellor/appointments/{$appointment->id}/review", []);

    $response->assertSessionHasErrors('decision');
});

test('counsellor can approve an appointment after admin review', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    [, $client] = asAppointmentClient();
    $counsellorUser = User::factory()->role(UserRole::Counselor)->create();

    $appointment = Appointment::create([
        'reference_no' => 'WJB/2026/REV003',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'needs_review',
    ]);

    $response = $this->actingAs($counsellorUser)
        ->patch("/counsellor/appointments/{$appointment->id}/review", ['note' => 'Looks good.']);

    $response->assertSessionHasNoErrors();
    $this->assertDatabaseHas('appointments', ['id' => $appointment->id, 'status' => 'approved']);
});

test('a client cannot access the admin appointment queue', function () {
    [$user] = asAppointmentClient();

    $this->actingAs($user)->get('/admin/appointments')->assertForbidden();
});

// --- Legacy route cleanup -------------------------------------------------

test('the old counsellor-timetable route redirects to the real slot manager', function () {
    $this->actingAs(asAppointmentAdmin())
        ->get('/admin/counsellor-timetable')
        ->assertRedirect('/admin/slots');
});

// --- Counsellor-scoped slot management --------------------------------

function asLinkedCounsellor(CounsellingLocation $location): array
{
    $user = User::factory()->role(UserRole::Counselor)->create();
    $counsellor = Counsellor::create([
        'user_id' => $user->id,
        'worker_no' => 'W-'.uniqid(),
        'name' => 'Linked Counsellor '.uniqid(),
        'counsellor_type' => 'staff',
        'location_id' => $location->id,
        'status' => 'active',
    ]);

    return [$user, $counsellor];
}

test('a counsellor only sees their own slots on their own slot manager page', function () {
    $location = seedAppointmentLocation();
    [$user, $ownCounsellor] = asLinkedCounsellor($location);
    $otherCounsellor = seedAppointmentCounsellor($location);

    seedBookableSlot($location, $ownCounsellor);
    seedBookableSlot($location, $otherCounsellor, ['start_time' => '11:00', 'end_time' => '12:00']);

    $this->actingAs($user)
        ->get('/counsellor/slots')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('counsellor/slots')
            ->has('slots', 1)
            ->where('counsellorId', $ownCounsellor->id)
            ->where('counsellorName', $ownCounsellor->name)
            ->missing('counsellors'));
});

test('a counsellor saving new slots gets them force-assigned to themselves', function () {
    $location = seedAppointmentLocation();
    [$user, $ownCounsellor] = asLinkedCounsellor($location);
    $otherCounsellor = seedAppointmentCounsellor($location);

    $this->actingAs($user)->post('/counsellor/slots', [
        'new_slots' => [[
            'slot_date' => now()->addDays(6)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'counsellor_id' => $otherCounsellor->id, // spoofed — must be overridden
            'location_id' => $location->id,
            'session_types' => ['physical'],
        ]],
        'deleted_slot_ids' => [],
    ])->assertSessionHasNoErrors();

    expect(AppointmentSlot::where('counsellor_id', $ownCounsellor->id)->count())->toBe(1);
    expect(AppointmentSlot::where('counsellor_id', $otherCounsellor->id)->count())->toBe(0);
});

test('a counsellor cannot delete another counsellor\'s slot', function () {
    $location = seedAppointmentLocation();
    [$user] = asLinkedCounsellor($location);
    $otherCounsellor = seedAppointmentCounsellor($location);
    $foreignSlot = seedBookableSlot($location, $otherCounsellor);

    $response = $this->actingAs($user)->post('/counsellor/slots', [
        'new_slots' => [],
        'deleted_slot_ids' => [$foreignSlot->id],
    ]);

    $response->assertSessionHasErrors('deleted_slot_ids');
    $this->assertDatabaseHas('appointment_slots', ['id' => $foreignSlot->id]);
});

test('an admin still sees every counsellor\'s slots on the admin slot manager page', function () {
    $location = seedAppointmentLocation();
    [, $ownCounsellor] = asLinkedCounsellor($location);
    $otherCounsellor = seedAppointmentCounsellor($location);

    seedBookableSlot($location, $ownCounsellor);
    seedBookableSlot($location, $otherCounsellor, ['start_time' => '11:00', 'end_time' => '12:00']);

    $this->actingAs(asAppointmentAdmin())
        ->get('/admin/slots')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/slots')
            ->has('slots', 2)
            ->has('counsellors', 2));
});

test('an admin cannot use the counsellor-only slot manager route', function () {
    $this->actingAs(asAppointmentAdmin())
        ->get('/counsellor/slots')
        ->assertForbidden();
});

// --- Page render smoke tests (catches Inertia prop-shape mismatches) ----

test('admin slot manager page renders with real data', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    seedBookableSlot($location, $counsellor);

    $this->actingAs(asAppointmentAdmin())
        ->get('/admin/slots')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/slots')->has('slots', 1)->has('counsellors')->has('locations'));
});

test('admin appointment queue page renders with real data', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    [, $client] = asAppointmentClient();

    Appointment::create([
        'reference_no' => 'WJB/2026/SMOKE1',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'pending',
    ]);

    $this->actingAs(asAppointmentAdmin())
        ->get('/admin/appointments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/appointments')->has('appointments', 1));
});

test('counsellor slot manager and appointment queue pages render with real data', function () {
    $location = seedAppointmentLocation();
    [$counsellorUser] = asLinkedCounsellor($location);

    $this->actingAs($counsellorUser)->get('/counsellor/slots')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('counsellor/slots')->has('locations'));

    $this->actingAs($counsellorUser)->get('/counsellor/appointments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('counsellor/appointments')->has('appointments'));
});

test('a counsellor account with no linked counsellor record cannot use the slot manager', function () {
    $orphanUser = User::factory()->role(UserRole::Counselor)->create();

    $this->actingAs($orphanUser)->get('/counsellor/slots')->assertForbidden();
});

test('client booking and appointment records pages render with real data', function () {
    $location = seedAppointmentLocation();
    $counsellor = seedAppointmentCounsellor($location);
    seedBookableSlot($location, $counsellor);
    [$user] = asAppointmentClient();

    $this->actingAs($user)->get('/psycare/permohonan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('psycare/permohonan')
            ->has('availableSlots', 1)
            ->has('locations')
            ->has('client')
            ->has('followUpEligibleAppointments'));

    $this->actingAs($user)->get('/psycare/rekod-temujanji')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('psycare/rekod-temujanji')->has('appointments'));
});
