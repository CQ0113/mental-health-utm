<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('recipient_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('appointment_id')->nullable()->constrained('appointments')->cascadeOnDelete();
            $table->foreignUuid('declaration_id')->nullable()->constrained('declarations')->cascadeOnDelete();
            $table->string('event_type');
            $table->string('subject');
            $table->text('body');
            $table->enum('status', ['queued', 'sent', 'failed'])->default('queued');
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['recipient_user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_notifications');
    }
};
