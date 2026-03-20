<?php

use App\Http\Controllers\ForumModerationController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::post('/psycare/forum/moderate', ForumModerationController::class)
	->withoutMiddleware([ValidateCsrfToken::class])
	->name('psycare.forum.moderate');

Route::redirect('/psycare', '/psycare/dashboard')->name('psycare');
Route::redirect('/admin', '/admin/dashboard')->name('admin');
Route::redirect('/counsellor', '/counsellor/dashboard')->name('counsellor');

Route::prefix('admin')->group(function () {
	Route::inertia('/dashboard', 'admin/dashboard')->name('admin.dashboard');
	Route::inertia('/service', 'admin/service')->name('admin.service');
	Route::inertia('/counsellor-ppsi', 'admin/counsellor-ppsi')->name('admin.counsellor-ppsi');
	Route::inertia('/counsellor-timetable', 'admin/counsellor-timetable')->name('admin.counsellor-timetable');
	Route::inertia('/client-information', 'admin/client-information')->name('admin.client-information');
	Route::inertia('/appointments', 'admin/appointments')->name('admin.appointments');
	Route::inertia('/materials', 'admin/materials')->name('admin.materials');
	Route::inertia('/learning-materials', 'admin/learning-materials')->name('admin.learning-materials');
	Route::inertia('/forum', 'admin/forum')->name('admin.forum');
});

Route::prefix('counsellor')->group(function () {
	Route::inertia('/dashboard', 'counsellor/dashboard')->name('counsellor.dashboard');
	Route::inertia('/appointments', 'counsellor/appointments')->name('counsellor.appointments');
	Route::inertia('/slots', 'admin/slots')->name('counsellor.slots');
	Route::inertia('/caseload', 'counsellor/caseload')->name('counsellor.caseload');
	Route::inertia('/tasks', 'counsellor/tasks')->name('counsellor.tasks');
	Route::inertia('/assessments', 'counsellor/assessments')->name('counsellor.assessments');
});

Route::prefix('psycare')->group(function () {
	Route::inertia('/dashboard', 'psycare/dashboard')->name('psycare.dashboard');
	Route::inertia('/permohonan', 'psycare/permohonan')->name('psycare.permohonan');
	Route::inertia('/rekod-temujanji', 'psycare/rekod-temujanji')->name('psycare.rekod-temujanji');
	Route::inertia('/ujian-psikometrik', 'psycare/ujian-psikometrik')->name('psycare.ujian-psikometrik');
	Route::inertia('/resource-library', 'psycare/resource-library')->name('psycare.resource-library');
	Route::inertia('/perkhidmatan', 'psycare/perkhidmatan')->name('psycare.perkhidmatan');
	Route::inertia('/jurnal-pintar', 'psycare/jurnal-pintar')->name('psycare.jurnal-pintar');
	Route::inertia('/forum-sokongan', 'psycare/forum-sokongan')->name('psycare.forum-sokongan');
});
