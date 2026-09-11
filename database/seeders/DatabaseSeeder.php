<?php

namespace Database\Seeders;

use App\Enums\ClientType;
use App\Enums\CounsellorType;
use App\Enums\UserRole;
use App\Http\Controllers\Auth\AuthController;
use App\Models\Client;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Models\ForumCategory;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed baseline demo data so every portal has something to log into
     * and look at. Idempotent — safe to re-run against Supabase.
     */
    public function run(): void
    {
        $passwordHash = Hash::make(AuthController::DEMO_PASSWORD);

        $location = CounsellingLocation::firstOrCreate(
            ['code' => 'PUSAT-KAUNSELING-JB'],
            [
                'name' => 'PUSAT KAUNSELING (JB)',
                'campus' => 'Johor Bahru',
                'address' => 'Universiti Teknologi Malaysia, 81310 Johor Bahru',
                'is_active' => true,
            ]
        );

        CounsellingLocation::firstOrCreate(
            ['code' => 'PUSAT-KAUNSELING-KL'],
            [
                'name' => 'PUSAT KAUNSELING (KL)',
                'campus' => 'Kuala Lumpur',
                'address' => 'UTM Kuala Lumpur, Jalan Sultan Yahya Petra, 54100 Kuala Lumpur',
                'is_active' => true,
            ]
        );

        // --- Admin -----------------------------------------------------
        User::firstOrCreate(
            ['email' => 'admin@psycare.test'],
            ['name' => 'PsyCare Admin', 'password_hash' => $passwordHash, 'role' => UserRole::Admin]
        );

        // --- Counsellors -------------------------------------------------
        $counsellorSeeds = [
            ['name' => 'Dr. Aisha Rahman', 'email' => 'counsellor@psycare.test', 'ppsi_no' => 'PPSI-0001', 'type' => CounsellorType::Staff],
            ['name' => 'En. Faiz Kamal', 'email' => 'counsellor2@psycare.test', 'ppsi_no' => 'PPSI-0002', 'type' => CounsellorType::Trainee],
        ];

        foreach ($counsellorSeeds as $seed) {
            $user = User::firstOrCreate(
                ['email' => $seed['email']],
                ['name' => $seed['name'], 'password_hash' => $passwordHash, 'role' => UserRole::Counselor]
            );

            Counsellor::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'ppsi_no' => $seed['ppsi_no'],
                    'name' => $seed['name'],
                    'counsellor_type' => $seed['type'],
                    'location_id' => $location->id,
                    'email' => $seed['email'],
                ]
            );
        }

        // --- Clients -----------------------------------------------------
        $clientSeeds = [
            ['name' => 'Nurul Izzah', 'email' => 'client@psycare.test', 'matrix_no' => 'A20EC0101', 'type' => ClientType::Student],
            ['name' => 'Wei Ming Tan', 'email' => 'client2@psycare.test', 'matrix_no' => 'A20EC0102', 'type' => ClientType::Student],
            ['name' => 'Farah Aina', 'email' => 'client3@psycare.test', 'matrix_no' => null, 'type' => ClientType::Staff],
        ];

        foreach ($clientSeeds as $seed) {
            $user = User::firstOrCreate(
                ['email' => $seed['email']],
                ['name' => $seed['name'], 'password_hash' => $passwordHash, 'role' => UserRole::Client]
            );

            Client::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $seed['name'],
                    'client_type' => $seed['type'],
                    'matrix_no' => $seed['matrix_no'],
                    'worker_no' => $seed['type'] === ClientType::Staff ? 'W-1001' : null,
                    'email' => $seed['email'],
                    'profile_locked' => true,
                ]
            );
        }

        // --- Forum categories ---------------------------------------------
        foreach (['Stress & Anxiety', 'Sleep & Rest', 'Academic Pressure', 'General Support'] as $name) {
            ForumCategory::firstOrCreate(['name' => $name], ['is_active' => true]);
        }
    }
}
