<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Reproduces the Chatbot And Tracking module tables: emotion_logs,
     * chat_sessions, chat_messages, risk_flags, counsellor_tasks.
     */
    public function up(): void
    {
        Schema::create('emotion_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->unsignedTinyInteger('score');
            $table->string('mood_label')->nullable();
            $table->text('note')->nullable();
            $table->timestamp('logged_at')->useCurrent();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['client_id', 'logged_at']);
        });

        Schema::create('chat_sessions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('status', ['open', 'saved', 'closed'])->default('open');
            $table->timestamp('started_at')->useCurrent();
            $table->timestamp('saved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
        });

        Schema::create('chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('chat_session_id')->constrained('chat_sessions')->cascadeOnDelete();
            $table->enum('sender_role', ['user', 'bot', 'system']);
            $table->text('message');
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('risk_flags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('assigned_counsellor_id')->nullable()->constrained('counsellors')->nullOnDelete();
            $table->enum('source', ['emotion_log', 'ai_chatbot', 'psychometric', 'forum']);
            $table->uuid('source_ref_id')->nullable();
            $table->enum('severity', ['low', 'moderate', 'high']);
            $table->text('message')->nullable();
            $table->enum('status', ['open', 'in_review', 'resolved', 'dismissed'])->default('open');
            $table->timestamp('flagged_at')->useCurrent();
            $table->foreignUuid('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamp('resolved_at')->nullable();

            $table->index(['client_id', 'status']);
        });

        Schema::create('counsellor_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('counsellor_id')->constrained('counsellors')->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->cascadeOnDelete();
            $table->foreignUuid('risk_flag_id')->nullable()->constrained('risk_flags')->nullOnDelete();
            $table->string('title');
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->timestamp('due_at')->nullable();
            $table->enum('status', ['open', 'in_progress', 'completed', 'cancelled'])->default('open');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('counsellor_tasks');
        Schema::dropIfExists('risk_flags');
        Schema::dropIfExists('chat_messages');
        Schema::dropIfExists('chat_sessions');
        Schema::dropIfExists('emotion_logs');
    }
};
