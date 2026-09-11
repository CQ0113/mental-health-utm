<?php

use App\Enums\DeclarationStatus;
use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\Client;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\Declaration;
use App\Models\TermsAcceptance;
use App\Models\User;

function asDeclarationAdmin(): User
{
    return User::factory()->role(UserRole::Admin)->create();
}

function asDeclarationClient(): array
{
    $user = User::factory()->role(UserRole::Client)->create();
    $client = Client::create([
        'user_id' => $user->id,
        'full_name' => 'Declaring Client',
        'client_type' => 'student',
        'matrix_no' => 'A26DC'.uniqid(),
        'faculty' => 'Fakulti Komputeran',
    ]);

    return [$user, $client];
}

function submittedDeclarationFor(Client $client): Declaration
{
    return Declaration::create([
        'client_id' => $client->id,
        'appointment_id' => null,
        'declaration_text' => config('psycare.declaration.text'),
        'is_checked' => true,
        'status' => DeclarationStatus::Submitted,
        'submitted_at' => now(),
    ]);
}

// --- DC02 Submit Declaration -------------------------------------------

test('a client can submit their information declaration', function () {
    [$user, $client] = asDeclarationClient();

    $response = $this->actingAs($user)->post('/psycare/declarations', [
        'is_checked' => true,
    ]);

    $response->assertSessionHasNoErrors();

    $declaration = Declaration::where('client_id', $client->id)->firstOrFail();
    expect($declaration->status)->toBe(DeclarationStatus::Submitted)
        ->and($declaration->is_checked)->toBeTrue()
        ->and($declaration->submitted_at)->not->toBeNull()
        // Profile-level: not tied to any appointment.
        ->and($declaration->appointment_id)->toBeNull()
        // The exact wording agreed to is copied onto the row.
        ->and($declaration->declaration_text)->toBe(config('psycare.declaration.text'));
});

test('submitting without ticking the checkbox is rejected (DC02 EF1)', function () {
    [$user, $client] = asDeclarationClient();

    $this->actingAs($user)
        ->post('/psycare/declarations', ['is_checked' => false])
        ->assertSessionHasErrors('is_checked');

    expect(Declaration::where('client_id', $client->id)->exists())->toBeFalse();
});

test('a user with no client profile cannot submit a declaration (DC02 EF2)', function () {
    $orphan = User::factory()->role(UserRole::Client)->create();

    $this->actingAs($orphan)
        ->post('/psycare/declarations', ['is_checked' => true])
        ->assertForbidden();
});

test('resubmitting after a correction request updates the same declaration', function () {
    [$user, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $declaration->update([
        'status' => DeclarationStatus::CorrectionRequired,
        'correction_note' => 'Please fix your faculty.',
    ]);

    $this->actingAs($user)
        ->post('/psycare/declarations', ['is_checked' => true])
        ->assertSessionHasNoErrors();

    expect(Declaration::where('client_id', $client->id)->count())->toBe(1);
    $declaration->refresh();
    expect($declaration->status)->toBe(DeclarationStatus::Submitted)
        // The previous review outcome is cleared — it's awaiting a fresh one.
        ->and($declaration->correction_note)->toBeNull();
});

test('a verified declaration cannot be resubmitted', function () {
    [$user, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $declaration->update(['status' => DeclarationStatus::Verified, 'verified_at' => now()]);

    $this->actingAs($user)
        ->post('/psycare/declarations', ['is_checked' => true])
        ->assertSessionHasErrors('is_checked');
});

// --- DC01 View Declaration Form ----------------------------------------

test('the client profile page carries the declaration for the confirmation tab', function () {
    [$user, $client] = asDeclarationClient();
    submittedDeclarationFor($client);

    $this->actingAs($user)
        ->get('/psycare/perkhidmatan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('psycare/perkhidmatan')
            ->where('myDeclaration.status', 'submitted')
            ->has('declarationText'));
});

// --- DC03 Verify Declaration -------------------------------------------

test('an admin can verify a submitted declaration', function () {
    [, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $admin = asDeclarationAdmin();

    $this->actingAs($admin)
        ->patch("/admin/declarations/{$declaration->id}/verify")
        ->assertSessionHasNoErrors();

    $declaration->refresh();
    expect($declaration->status)->toBe(DeclarationStatus::Verified)
        ->and($declaration->verified_by_user_id)->toBe($admin->id)
        ->and($declaration->verified_at)->not->toBeNull();

    $this->assertDatabaseHas('declaration_verification_events', [
        'declaration_id' => $declaration->id,
        'verifier_user_id' => $admin->id,
        'action' => 'verified',
    ]);
});

test('a counsellor can also verify a declaration', function () {
    [, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $counsellorUser = User::factory()->role(UserRole::Counselor)->create();

    $this->actingAs($counsellorUser)
        ->patch("/counsellor/declarations/{$declaration->id}/verify")
        ->assertSessionHasNoErrors();

    expect($declaration->refresh()->status)->toBe(DeclarationStatus::Verified);
});

test('verifying an already-verified declaration is rejected (DC03 EF2)', function () {
    [, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $declaration->update(['status' => DeclarationStatus::Verified, 'verified_at' => now()]);

    $this->actingAs(asDeclarationAdmin())
        ->patch("/admin/declarations/{$declaration->id}/verify")
        ->assertSessionHasErrors('declaration');
});

test('verifying a declaration the client never submitted is rejected (DC03 EF1)', function () {
    [, $client] = asDeclarationClient();
    $declaration = Declaration::create([
        'client_id' => $client->id,
        'declaration_text' => config('psycare.declaration.text'),
        'is_checked' => false,
        'status' => DeclarationStatus::Draft,
    ]);

    $this->actingAs(asDeclarationAdmin())
        ->patch("/admin/declarations/{$declaration->id}/verify")
        ->assertSessionHasErrors('declaration');
});

test('an admin can request a correction with a note', function () {
    [, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);
    $admin = asDeclarationAdmin();

    $this->actingAs($admin)
        ->patch("/admin/declarations/{$declaration->id}/correction", [
            'note' => 'Your faculty does not match your matric number.',
        ])
        ->assertSessionHasNoErrors();

    $declaration->refresh();
    expect($declaration->status)->toBe(DeclarationStatus::CorrectionRequired)
        ->and($declaration->correction_note)->toBe('Your faculty does not match your matric number.');

    $this->assertDatabaseHas('declaration_verification_events', [
        'declaration_id' => $declaration->id,
        'action' => 'correction_required',
    ]);
});

test('requesting a correction without a note is rejected', function () {
    [, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);

    $this->actingAs(asDeclarationAdmin())
        ->patch("/admin/declarations/{$declaration->id}/correction", ['note' => ''])
        ->assertSessionHasErrors('note');
});

test('a client cannot verify their own declaration', function () {
    [$user, $client] = asDeclarationClient();
    $declaration = submittedDeclarationFor($client);

    $this->actingAs($user)
        ->patch("/admin/declarations/{$declaration->id}/verify")
        ->assertForbidden();
});

// --- Terms and Conditions (blocking first-use pop-up) -------------------

test('a client who has not accepted the terms gets the blocking prop', function () {
    [$user] = asDeclarationClient();

    $this->actingAs($user)
        ->get('/psycare/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('termsAcceptance.accepted', false)
            ->where('termsAcceptance.version', config('psycare.terms.version')));
});

test('a client can accept the terms and the prop flips', function () {
    [$user, $client] = asDeclarationClient();

    $this->actingAs($user)
        ->post('/psycare/terms/accept', ['accepted' => true])
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('terms_acceptances', [
        'client_id' => $client->id,
        'terms_version' => config('psycare.terms.version'),
        'accepted' => true,
    ]);

    $this->actingAs($user)
        ->get('/psycare/dashboard')
        ->assertInertia(fn ($page) => $page->where('termsAcceptance.accepted', true));
});

test('accepting the terms twice updates the same row rather than erroring', function () {
    [$user, $client] = asDeclarationClient();

    $this->actingAs($user)->post('/psycare/terms/accept', ['accepted' => true]);
    $this->actingAs($user)->post('/psycare/terms/accept', ['accepted' => true])
        ->assertSessionHasNoErrors();

    expect(TermsAcceptance::where('client_id', $client->id)->count())->toBe(1);
});

test('bumping the terms version asks the client to accept again', function () {
    [$user, $client] = asDeclarationClient();
    $this->actingAs($user)->post('/psycare/terms/accept', ['accepted' => true]);

    config(['psycare.terms.version' => '2099-01-01']);

    $this->actingAs($user)
        ->get('/psycare/dashboard')
        ->assertInertia(fn ($page) => $page->where('termsAcceptance.accepted', false));

    // The original acceptance stays on record as proof of what they agreed to.
    expect(TermsAcceptance::where('client_id', $client->id)->count())->toBe(1);
});

test('the terms prop is null for admins so the pop-up never shows there', function () {
    $this->actingAs(asDeclarationAdmin())
        ->get('/admin/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('termsAcceptance', null));
});

// --- Verification surfaces ---------------------------------------------

test('the admin client information page carries each client declaration', function () {
    $location = CounsellingLocation::create([
        'code' => 'DC-'.uniqid(),
        'name' => 'PUSAT KAUNSELING (JB)',
        'is_active' => true,
    ]);
    [, $client] = asDeclarationClient();
    submittedDeclarationFor($client);

    Appointment::create([
        'reference_no' => 'WJB/2026/DC001',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'status' => 'pending',
    ]);

    $this->actingAs(asDeclarationAdmin())
        ->get('/admin/client-information')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('records', 1)
            ->where('records.0.declaration.status', 'submitted')
            // The page calls `record.status.toUpperCase()`, so a missing
            // key here blanks the whole admin screen at runtime.
            ->where('records.0.status', 'active'));
});

test('the counsellor appointment queue carries the client declaration for verification', function () {
    $location = CounsellingLocation::create([
        'code' => 'DC-'.uniqid(),
        'name' => 'PUSAT KAUNSELING (JB)',
        'is_active' => true,
    ]);
    $counsellor = Counsellor::create([
        'worker_no' => 'W-'.uniqid(),
        'name' => 'Reviewing Counsellor',
        'counsellor_type' => 'staff',
        'location_id' => $location->id,
        'status' => 'active',
    ]);
    [, $client] = asDeclarationClient();
    submittedDeclarationFor($client);

    Appointment::create([
        'reference_no' => 'WJB/2026/DC002',
        'client_id' => $client->id,
        'appointment_type' => 'new',
        'session_type' => 'physical',
        'location_id' => $location->id,
        'counsellor_id' => $counsellor->id,
        'status' => 'needs_review',
    ]);

    $this->actingAs(User::factory()->role(UserRole::Counselor)->create())
        ->get('/counsellor/appointments')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('appointments', 1)
            ->where('appointments.0.declaration.status', 'submitted'));
});
