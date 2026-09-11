<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('declarations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('appointment_id')->nullable()->constrained('appointments')->cascadeOnDelete();
            $table->text('declaration_text');
            $table->boolean('is_checked')->default(false);
            $table->enum('status', [
                'draft', 'submitted', 'pending_verification', 'verified', 'correction_required', 'rejected',
            ])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignUuid('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('correction_note')->nullable();
            $table->timestamps();
        });

        Schema::create('declaration_verification_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('declaration_id')->constrained('declarations')->cascadeOnDelete();
            $table->foreignUuid('verifier_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('action', [
                'draft', 'submitted', 'pending_verification', 'verified', 'correction_required', 'rejected',
            ]);
            $table->text('note')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('declaration_verification_events');
        Schema::dropIfExists('declarations');
    }
};
