<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resource_library_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title_ms');
            $table->string('title_en');
            $table->text('description_ms')->nullable();
            $table->text('description_en')->nullable();
            $table->enum('category', ['stress', 'anxiety', 'sleep', 'support']);
            $table->enum('resource_type', ['article', 'video', 'toolkit']);
            $table->string('duration_label')->nullable();
            $table->text('url');
            $table->enum('visibility', ['draft', 'published', 'hidden', 'deleted'])->default('published');
            $table->foreignUuid('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('resource_access_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('resource_id')->constrained('resource_library_items')->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->timestamp('accessed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resource_access_logs');
        Schema::dropIfExists('resource_library_items');
    }
};
