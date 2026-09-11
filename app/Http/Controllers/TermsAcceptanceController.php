<?php

namespace App\Http\Controllers;

use App\Services\TermsAcceptanceService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/**
 * The blocking first-use Terms and Conditions pop-up. Whether the pop-up
 * shows at all is driven by the `termsAcceptance` prop shared from
 * HandleInertiaRequests, so every client page knows the answer without
 * asking for it.
 */
class TermsAcceptanceController extends Controller
{
    public function __construct(private readonly TermsAcceptanceService $terms) {}

    public function store(Request $request): RedirectResponse
    {
        $client = $request->user()->client;

        if (! $client) {
            abort(403, 'Only clients with a profile can accept the terms.');
        }

        $data = $request->validate([
            'accepted' => ['required', 'accepted'],
        ]);

        if (! $data['accepted']) {
            throw ValidationException::withMessages([
                'accepted' => 'Please tick the box to confirm you agree to the terms.',
            ]);
        }

        $this->terms->accept($client, $request->user(), $request);

        return back()->with('success', 'Terms accepted. You can now use PsyCare 2.0.');
    }
}
