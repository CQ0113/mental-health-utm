<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$existingTables = DB::select(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
);

if (count($existingTables) > 0 && ! in_array('--allow-existing', $argv, true)) {
    fwrite(STDERR, "Public schema is not empty. Existing tables:\n");
    foreach ($existingTables as $table) {
        fwrite(STDERR, "- {$table->table_name}\n");
    }
    fwrite(STDERR, "\nUse --allow-existing only if you intentionally want to continue.\n");
    exit(1);
}

$docPath = __DIR__.'/../../docs/postgresql-database-schema.md';
$doc = file_get_contents($docPath);

preg_match_all('/```sql\s*(.*?)```/s', $doc, $matches);

if ($matches[1] === []) {
    fwrite(STDERR, "No SQL code fences found in {$docPath}.\n");
    exit(1);
}

$schemaSql = implode("\n\n", array_map('trim', $matches[1]));

$laravelRuntimeSql = <<<'SQL'

CREATE TABLE IF NOT EXISTS migrations (
    id bigserial PRIMARY KEY,
    migration varchar(255) NOT NULL,
    batch integer NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    email varchar(255) PRIMARY KEY,
    token varchar(255) NOT NULL,
    created_at timestamp NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    id varchar(255) PRIMARY KEY,
    user_id uuid NULL,
    ip_address varchar(45) NULL,
    user_agent text NULL,
    payload text NOT NULL,
    last_activity integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON sessions (last_activity);

CREATE TABLE IF NOT EXISTS cache (
    key varchar(255) PRIMARY KEY,
    value text NOT NULL,
    expiration integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expiration ON cache (expiration);

CREATE TABLE IF NOT EXISTS cache_locks (
    key varchar(255) PRIMARY KEY,
    owner varchar(255) NOT NULL,
    expiration integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_locks_expiration ON cache_locks (expiration);

CREATE TABLE IF NOT EXISTS jobs (
    id bigserial PRIMARY KEY,
    queue varchar(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer NULL,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_queue ON jobs (queue);

CREATE TABLE IF NOT EXISTS job_batches (
    id varchar(255) PRIMARY KEY,
    name varchar(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text NULL,
    cancelled_at integer NULL,
    created_at integer NOT NULL,
    finished_at integer NULL
);

CREATE TABLE IF NOT EXISTS failed_jobs (
    id bigserial PRIMARY KEY,
    uuid varchar(255) NOT NULL UNIQUE,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO migrations (migration, batch)
SELECT migration, 1
FROM (
    VALUES
        ('0001_01_01_000000_create_users_table'),
        ('0001_01_01_000001_create_cache_table'),
        ('0001_01_01_000002_create_jobs_table')
) AS default_migrations(migration)
WHERE NOT EXISTS (
    SELECT 1 FROM migrations m WHERE m.migration = default_migrations.migration
);

SQL;

$fullSql = $schemaSql."\n\n".$laravelRuntimeSql;

$statements = array_values(array_filter(
    array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $fullSql)),
    static fn (string $statement): bool => $statement !== ''
));

$pdo = DB::connection()->getPdo();
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$executed = 0;

foreach ($statements as $statement) {
    $pdo->exec($statement);
    $executed++;
}

$tables = DB::select(
    "select table_name from information_schema.tables where table_schema = 'public' order by table_name"
);

$types = DB::select(
    "select typname from pg_type t join pg_namespace n on n.oid = t.typnamespace where n.nspname = 'public' and t.typtype = 'e' order by typname"
);

echo "Supabase schema applied successfully.\n";
echo "SQL statements executed: {$executed}\n";
echo "Enum types created: ".count($types)."\n";
echo "Public tables created: ".count($tables)."\n";

