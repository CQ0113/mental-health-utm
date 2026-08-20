<?php

use Illuminate\Contracts\Console\Kernel;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

require __DIR__.'/../../vendor/autoload.php';

$app = require __DIR__.'/../../bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

echo 'session driver: '.config('session.driver').PHP_EOL;
echo 'cache store: '.config('cache.default').PHP_EOL;
echo 'queue conn: '.config('queue.default').PHP_EOL;

Cache::put('supabase_check', 'ok', 60);
echo 'cache write/read: '.Cache::get('supabase_check').PHP_EOL;
Cache::forget('supabase_check');

echo 'cache table rows: '.DB::table('cache')->count().PHP_EOL;
echo 'sessions table rows: '.DB::table('sessions')->count().PHP_EOL;
echo 'jobs table rows: '.DB::table('jobs')->count().PHP_EOL;

echo 'ALL OK'.PHP_EOL;
