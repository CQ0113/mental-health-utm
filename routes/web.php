<?php

use App\Http\Controllers\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Admin\ClientInformationController;
use App\Http\Controllers\Admin\CounsellorController;
use App\Http\Controllers\Admin\SlotController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Counsellor\AppointmentController as CounsellorAppointmentController;
use App\Http\Controllers\Counsellor\SlotController as CounsellorSlotController;
use App\Http\Controllers\ForumModerationController;
use App\Http\Controllers\MyAccountController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/psycare')->name('home');

Route::get('/login', [AuthController::class, 'show'])
	->middleware('guest')
	->name('login');
Route::post('/login', [AuthController::class, 'login'])
	->middleware('guest')
	->name('login.attempt');
Route::post('/login/quick', [AuthController::class, 'quickLogin'])
	->middleware('guest')
	->name('login.quick');
Route::post('/logout', [AuthController::class, 'logout'])
	->middleware('auth')
	->name('logout');

Route::post('/psycare/forum/moderate', ForumModerationController::class)
	->withoutMiddleware([ValidateCsrfToken::class])
	->name('psycare.forum.moderate');

Route::redirect('/psycare', '/psycare/dashboard')->name('psycare');
Route::redirect('/admin', '/admin/dashboard')->name('admin');
Route::redirect('/counsellor', '/counsellor/dashboard')->name('counsellor');

Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(function () {
	Route::inertia('/dashboard', 'admin/dashboard')->name('admin.dashboard');
	Route::inertia('/service', 'admin/service')->name('admin.service');

	Route::get('/counsellor-ppsi', [CounsellorController::class, 'index'])->name('admin.counsellor-ppsi');
	Route::post('/counsellor-ppsi', [CounsellorController::class, 'store'])->name('admin.counsellor-ppsi.store');

	// The old "Counsellor Timetable" page duplicated the real Slot Manager
	// with a mock counsellor picker and localStorage persistence — the
	// route stays only so any bookmarked link still lands somewhere real.
	Route::redirect('/counsellor-timetable', '/admin/slots')->name('admin.counsellor-timetable');

	Route::get('/client-information', [ClientInformationController::class, 'index'])->name('admin.client-information');
	Route::post('/client-information', [ClientInformationController::class, 'store'])->name('admin.client-information.store');
	Route::put('/client-information/{appointment}', [ClientInformationController::class, 'update'])->name('admin.client-information.update');
	Route::delete('/client-information/{appointment}', [ClientInformationController::class, 'destroy'])->name('admin.client-information.destroy');

	Route::get('/slots', [SlotController::class, 'index'])->name('admin.slots');
	Route::post('/slots', [SlotController::class, 'save'])->name('admin.slots.save');

	Route::get('/appointments', [AdminAppointmentController::class, 'index'])->name('admin.appointments');
	Route::patch('/appointments/{appointment}/review', [AdminAppointmentController::class, 'review'])->name('admin.appointments.review');

	Route::inertia('/materials', 'admin/materials')->name('admin.materials');
	Route::inertia('/learning-materials', 'admin/learning-materials')->name('admin.learning-materials');
	Route::inertia('/forum', 'admin/forum')->name('admin.forum');
});

Route::prefix('counsellor')->middleware(['auth', 'role:counselor'])->group(function () {
	Route::inertia('/dashboard', 'counsellor/dashboard')->name('counsellor.dashboard');
	Route::get('/appointments', [CounsellorAppointmentController::class, 'index'])->name('counsellor.appointments');
	Route::patch('/appointments/{appointment}/review', [CounsellorAppointmentController::class, 'review'])->name('counsellor.appointments.review');
	Route::get('/slots', [CounsellorSlotController::class, 'index'])->name('counsellor.slots');
	Route::post('/slots', [CounsellorSlotController::class, 'save'])->name('counsellor.slots.save');
	Route::inertia('/caseload', 'counsellor/caseload')->name('counsellor.caseload');
	Route::inertia('/tasks', 'counsellor/tasks')->name('counsellor.tasks');
	Route::inertia('/assessments', 'counsellor/assessments')->name('counsellor.assessments');
});

Route::prefix('psycare')->middleware(['auth', 'role:client'])->group(function () {
	Route::inertia('/dashboard', 'psycare/dashboard')->name('psycare.dashboard');
	Route::get('/permohonan', [AppointmentController::class, 'create'])->name('psycare.permohonan');
	Route::post('/permohonan', [AppointmentController::class, 'store'])->name('psycare.permohonan.store');
	Route::get('/rekod-temujanji', [AppointmentController::class, 'records'])->name('psycare.rekod-temujanji');
	Route::inertia('/ujian-psikometrik', 'psycare/ujian-psikometrik')->name('psycare.ujian-psikometrik');
	Route::inertia('/resource-library', 'psycare/resource-library')->name('psycare.resource-library');
	Route::get('/perkhidmatan', [MyAccountController::class, 'show'])->name('psycare.perkhidmatan');
	Route::inertia('/jurnal-pintar', 'psycare/jurnal-pintar')->name('psycare.jurnal-pintar');
	Route::inertia('/forum-sokongan', 'psycare/forum-sokongan')->name('psycare.forum-sokongan');
});
