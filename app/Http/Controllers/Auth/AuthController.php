<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Demo accounts seeded by DatabaseSeeder for the quick-login panel.
     * Only ever exposed to the frontend when the app is running locally.
     */
    private const QUICK_LOGIN_ACCOUNTS = [
        ['role' => 'admin', 'email' => 'admin@psycare.test', 'label' => 'Admin'],
        ['role' => 'counselor', 'email' => 'counsellor@psycare.test', 'label' => 'Counsellor'],
        ['role' => 'client', 'email' => 'client@psycare.test', 'label' => 'Client'],
    ];

    /** Shared demo password for every quick-login/seeded account. */
    public const DEMO_PASSWORD = 'password';

    public function show(): Response
    {
        return Inertia::render('auth/login', [
            'quickLoginAccounts' => app()->environment(['local', 'testing'])
                ? self::QUICK_LOGIN_ACCOUNTS
                : [],
        ]);
    }

    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return back()
                ->withErrors(['email' => 'These credentials do not match our records.'])
                ->onlyInput('email');
        }

        $request->session()->regenerate();

        return $this->redirectForRole($request->user());
    }

    /**
     * Dev-only one-click login used for fast manual QA. Never available
     * outside the local environment, regardless of how the route is hit.
     */
    public function quickLogin(Request $request): RedirectResponse
    {
        abort_unless(app()->environment(['local', 'testing']), 404);

        $validated = $request->validate([
            'role' => ['required', 'string', 'in:admin,client,counselor'],
        ]);

        $account = collect(self::QUICK_LOGIN_ACCOUNTS)
            ->firstWhere('role', $validated['role']);

        $user = User::where('email', $account['email'])->first();

        abort_if(! $user, 404, 'Seeded demo account not found — run `php artisan db:seed` first.');

        Auth::login($user);
        $request->session()->regenerate();

        return $this->redirectForRole($user);
    }

    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    private function redirectForRole(User $user): RedirectResponse
    {
        return redirect()->to(match ($user->role) {
            UserRole::Admin => '/admin',
            UserRole::Counselor => '/counsellor',
            UserRole::Client => '/psycare',
        });
    }
}
