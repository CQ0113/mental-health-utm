<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$counts = [
    'public_tables' => "select count(1) as c from information_schema.tables where table_schema = 'public'",
    'enum_types' => "select count(1) as c from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typtype = 'e'",
    'foreign_keys' => "select count(1) as c from information_schema.table_constraints where table_schema = 'public' and constraint_type = 'FOREIGN KEY'",
    'indexes' => "select count(1) as c from pg_indexes where schemaname = 'public'",
];

foreach ($counts as $label => $sql) {
    echo "{$label}=".DB::selectOne($sql)->c.PHP_EOL;
}

$expectedTables = [
    'users',
    'clients',
    'terms_acceptances',
    'counsellors',
    'counselling_locations',
    'counselling_services',
    'appointments',
    'appointment_slots',
    'appointment_slot_session_types',
    'appointment_participants',
    'appointment_attachments',
    'declarations',
    'declaration_verification_events',
    'attendance_sessions',
    'attendance_participants',
    'attendance_events',
    'emotion_logs',
    'chat_sessions',
    'chat_messages',
    'risk_flags',
    'counsellor_tasks',
    'psychometric_tests',
    'psychometric_questions',
    'psychometric_options',
    'psychometric_submissions',
    'psychometric_answers',
    'resource_library_items',
    'resource_access_logs',
    'forum_categories',
    'forum_posts',
    'forum_supports',
    'forum_moderation_events',
    'email_notifications',
    'migrations',
    'password_reset_tokens',
    'sessions',
    'cache',
    'cache_locks',
    'jobs',
    'job_batches',
    'failed_jobs',
];

$expectedEnums = [
    'user_role',
    'account_status',
    'client_type',
    'counsellor_type',
    'service_session_mode',
    'session_type',
    'session_mode',
    'appointment_type',
    'appointment_status',
    'attendance_status',
    'attendance_method',
    'declaration_status',
    'risk_level',
    'risk_flag_status',
    'task_priority',
    'task_status',
    'resource_category',
    'resource_type',
    'content_visibility',
    'forum_post_status',
    'notification_status',
];

$actualTableNames = array_map(
    static fn (object $table): string => $table->table_name,
    DB::select("select table_name from information_schema.tables where table_schema = 'public'")
);

$actualEnumNames = array_map(
    static fn (object $type): string => $type->typname,
    DB::select("select typname from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typtype = 'e'")
);

echo 'missing_expected_tables='.count(array_diff($expectedTables, $actualTableNames)).PHP_EOL;
echo 'missing_expected_enums='.count(array_diff($expectedEnums, $actualEnumNames)).PHP_EOL;

echo PHP_EOL.'Tables:'.PHP_EOL;

$tables = DB::select(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
);

foreach ($tables as $table) {
    echo "- {$table->table_name}".PHP_EOL;
}
