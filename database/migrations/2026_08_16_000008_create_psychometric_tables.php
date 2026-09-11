<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('psychometric_tests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique();
            $table->string('title_ms');
            $table->string('title_en');
            $table->text('description_ms')->nullable();
            $table->text('description_en')->nullable();
            $table->string('category')->nullable();
            $table->unsignedInteger('estimated_minutes')->nullable();
            $table->string('source_pdf_file_name')->nullable();
            $table->foreignUuid('uploaded_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('visibility', ['draft', 'published', 'hidden', 'deleted'])->default('published');
            $table->timestamps();
        });

        Schema::create('psychometric_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('test_id')->constrained('psychometric_tests')->cascadeOnDelete();
            $table->unsignedInteger('position');
            $table->text('prompt_ms');
            $table->text('prompt_en');

            $table->unique(['test_id', 'position']);
        });

        Schema::create('psychometric_options', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('test_id')->nullable()->constrained('psychometric_tests')->cascadeOnDelete();
            $table->unsignedTinyInteger('value');
            $table->string('label_ms');
            $table->string('label_en');

            $table->unique(['test_id', 'value']);
        });

        Schema::create('psychometric_submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('test_id')->constrained('psychometric_tests')->cascadeOnDelete();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->timestamp('submitted_at')->useCurrent();
            $table->unsignedInteger('total_score');
            $table->unsignedInteger('max_score');
            $table->unsignedTinyInteger('score_percent');
            $table->enum('risk_level', ['low', 'moderate', 'high']);
            $table->text('ai_summary_ms')->nullable();
            $table->text('ai_summary_en')->nullable();
            $table->text('ai_recommendation_ms')->nullable();
            $table->text('ai_recommendation_en')->nullable();

            $table->index(['client_id', 'submitted_at']);
        });

        Schema::create('psychometric_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('submission_id')->constrained('psychometric_submissions')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('psychometric_questions')->cascadeOnDelete();
            $table->unsignedTinyInteger('option_value');

            $table->unique(['submission_id', 'question_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('psychometric_answers');
        Schema::dropIfExists('psychometric_submissions');
        Schema::dropIfExists('psychometric_options');
        Schema::dropIfExists('psychometric_questions');
        Schema::dropIfExists('psychometric_tests');
    }
};
