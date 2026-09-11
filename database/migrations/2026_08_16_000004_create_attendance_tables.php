<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('appointment_id')->unique()->constrained('appointments')->cascadeOnDelete();
            $table->enum('session_mode', ['individual', 'group'])->default('individual');
            $table->string('qr_token_hash')->nullable();
            $table->foreignUuid('qr_generated_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('qr_generated_at')->nullable();
            $table->timestamp('qr_expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('attendance_participants', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attendance_session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('status', ['pending', 'present', 'absent', 'excused'])->default('pending');
            $table->enum('method', ['manual', 'physical_qr', 'online_auto'])->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->foreignUuid('recorded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('updated_at')->useCurrent();

            $table->unique(['attendance_session_id', 'client_id']);
        });

        Schema::create('attendance_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attendance_session_id')->constrained('attendance_sessions')->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('event_type', ['manual_update', 'qr_scan', 'online_join', 'online_leave']);
            $table->enum('method', ['manual', 'physical_qr', 'online_auto'])->nullable();
            $table->json('metadata')->default(new \Illuminate\Database\Query\Expression("'{}'"));
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_events');
        Schema::dropIfExists('attendance_participants');
        Schema::dropIfExists('attendance_sessions');
    }
};
