<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reproduces the Appointment and Scheduling module tables:
     * slot_generation_batches, appointment_slots,
     * appointment_slot_session_types, appointments,
     * appointment_participants, appointment_attachments.
     */
    public function up(): void
    {
        Schema::create('slot_generation_batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('generation_method', ['manual', 'bulk', 'csv']);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('slot_template')->nullable();
            $table->boolean('replace_existing')->default(false);
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('valid_rows')->default(0);
            $table->unsignedInteger('skipped_rows')->default(0);
            $table->text('summary')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('appointment_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->date('slot_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('label');
            $table->foreignUuid('counsellor_id')->nullable()->constrained('counsellors')->nullOnDelete();
            $table->foreignUuid('location_id')->nullable()->constrained('counselling_locations')->nullOnDelete();
            $table->foreignUuid('batch_id')->nullable()->constrained('slot_generation_batches')->nullOnDelete();
            $table->unsignedInteger('capacity')->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignUuid('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['slot_date', 'start_time', 'end_time', 'counsellor_id'], 'appointment_slots_date_time_counsellor_unique');
            $table->index('slot_date');
        });

        Schema::create('appointment_slot_session_types', function (Blueprint $table) {
            $table->foreignUuid('slot_id')->constrained('appointment_slots')->cascadeOnDelete();
            $table->enum('session_type', ['physical', 'online']);

            $table->primary(['slot_id', 'session_type']);
        });

        Schema::create('appointments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('reference_no')->unique();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignUuid('requested_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('previous_appointment_id')->nullable()->constrained('appointments')->nullOnDelete();
            $table->enum('appointment_type', ['new', 'follow_up'])->default('new');
            $table->enum('session_type', ['physical', 'online']);
            $table->enum('session_mode', ['individual', 'group'])->default('individual');
            $table->foreignUuid('service_id')->nullable()->constrained('counselling_services')->nullOnDelete();
            $table->foreignUuid('location_id')->nullable()->constrained('counselling_locations')->nullOnDelete();
            $table->foreignUuid('slot_id')->nullable()->constrained('appointment_slots')->nullOnDelete();
            $table->foreignUuid('counsellor_id')->nullable()->constrained('counsellors')->nullOnDelete();
            $table->date('preferred_date')->nullable();
            $table->text('appointment_need')->nullable();
            $table->text('issue_summary')->nullable();
            $table->text('attachment_description')->nullable();
            $table->text('applicant_note')->nullable();
            $table->boolean('attended_before')->default(false);
            $table->enum('status', [
                'draft', 'pending', 'needs_review', 'counsellor_reviewing',
                'approved', 'on_going', 'complete', 'completed', 'follow_up', 'closed',
            ])->default('pending');
            $table->foreignUuid('admin_review_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('admin_review_note')->nullable();
            $table->timestamp('admin_reviewed_at')->nullable();
            $table->foreignUuid('counsellor_review_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('counsellor_review_note')->nullable();
            $table->timestamp('counsellor_reviewed_at')->nullable();
            $table->text('meeting_link')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index('client_id');
            $table->index('counsellor_id');
            $table->index('status');
            $table->index('previous_appointment_id');
        });

        Schema::create('appointment_participants', function (Blueprint $table) {
            $table->foreignUuid('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('participant_role', ['primary', 'group_member'])->default('primary');
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['appointment_id', 'client_id']);
        });

        Schema::create('appointment_attachments', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')->constrained('appointments')->cascadeOnDelete();
            $table->foreignUuid('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('file_name');
            $table->string('file_path');
            $table->text('description')->nullable();
            $table->timestamp('uploaded_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appointment_attachments');
        Schema::dropIfExists('appointment_participants');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('appointment_slot_session_types');
        Schema::dropIfExists('appointment_slots');
        Schema::dropIfExists('slot_generation_batches');
    }
};
