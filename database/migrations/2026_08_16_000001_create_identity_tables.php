<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reproduces the User Management module tables from
     * docs/postgresql-database-schema.md: counselling_locations,
     * counselling_services, clients, terms_acceptances, counsellors.
     */
    public function up(): void
    {
        Schema::create('counselling_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('campus')->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('counselling_services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('name');
            $table->unsignedInteger('duration_minutes');
            $table->foreignUuid('location_id')->nullable()->constrained('counselling_locations')->nullOnDelete();
            $table->enum('session_mode', ['physical', 'online', 'hybrid'])->default('physical');
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('full_name');
            $table->string('preferred_name')->nullable();
            $table->enum('client_type', ['student', 'staff', 'alumni']);
            $table->string('national_id')->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->text('current_address')->nullable();
            $table->string('faculty')->nullable();
            $table->string('program')->nullable();
            $table->string('matrix_no')->nullable()->unique();
            $table->string('student_no')->nullable()->unique();
            $table->string('worker_no')->nullable()->unique();
            $table->string('marital_status')->nullable();
            $table->unsignedInteger('dependent_count')->default(0);
            $table->text('treatment_history')->nullable();
            $table->text('current_medications')->nullable();
            $table->boolean('profile_locked')->default(true);
            $table->timestamps();

            $table->index('matrix_no');
            $table->index('worker_no');
        });

        Schema::create('terms_acceptances', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('terms_version');
            $table->boolean('accepted')->default(false);
            $table->timestamp('accepted_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'terms_version']);
            $table->index('user_id');
        });

        Schema::create('counsellors', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('ppsi_no')->nullable()->unique();
            $table->string('worker_no')->nullable()->unique();
            $table->string('name');
            $table->enum('counsellor_type', ['staff', 'trainee'])->default('staff');
            $table->string('organization')->nullable();
            $table->foreignUuid('location_id')->nullable()->constrained('counselling_locations')->nullOnDelete();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('specialization')->nullable();
            $table->timestamps();

            $table->index('location_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counsellors');
        Schema::dropIfExists('terms_acceptances');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('counselling_services');
        Schema::dropIfExists('counselling_locations');
    }
};
