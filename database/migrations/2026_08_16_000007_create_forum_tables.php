<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('forum_categories', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->boolean('is_active')->default(true);
        });

        Schema::create('forum_posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('author_client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignUuid('category_id')->nullable()->constrained('forum_categories')->nullOnDelete();
            $table->string('title');
            $table->text('content');
            $table->unsignedTinyInteger('safety_score')->default(90);
            $table->text('moderation_reason')->nullable();
            $table->enum('status', ['pending_review', 'published', 'hidden', 'deleted'])->default('published');
            $table->timestamps();

            $table->index(['status', 'safety_score']);
        });

        Schema::create('forum_supports', function (Blueprint $table) {
            $table->foreignUuid('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->primary(['post_id', 'client_id']);
        });

        Schema::create('forum_moderation_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('post_id')->constrained('forum_posts')->cascadeOnDelete();
            $table->foreignUuid('moderator_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('action', ['approve', 'hide', 'restore', 'delete']);
            $table->enum('previous_status', ['pending_review', 'published', 'hidden', 'deleted'])->nullable();
            $table->enum('next_status', ['pending_review', 'published', 'hidden', 'deleted']);
            $table->text('reason')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('forum_moderation_events');
        Schema::dropIfExists('forum_supports');
        Schema::dropIfExists('forum_posts');
        Schema::dropIfExists('forum_categories');
    }
};
