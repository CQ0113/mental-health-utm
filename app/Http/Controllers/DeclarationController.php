<?php

namespace App\Http\Controllers;

use App\Services\DeclarationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * DC01 View Declaration Form / DC02 Submit Declaration — client half.
 *
 * DC01 needs no route of its own: the declaration form is a tab on the
 * client's own profile page, so MyAccountController ships its current state
 * alongside the profile it belongs to. This controller only handles the
 * submit step (DC02 AF1). Verification (DC03) lives in
 * Admin\DeclarationController and Counsellor\DeclarationController.
 */
class DeclarationController extends Controller
{
    public function __construct(private readonly DeclarationService $declarations) {}

    public function store(Request $request): RedirectResponse
    {
        $client = $request->user()->client;

        // DC02 EF2 — "the declaration cannot be submitted until required
        // profile or declaration information is available."
        if (! $client) {
            abort(403, 'A client profile is required before submitting a declaration.');
        }

        $data = $request->validate([
            'is_checked' => ['boolean'],
        ]);

        $this->declarations->submit($client, (bool) ($data['is_checked'] ?? false));

        return back()->with('success', 'Client declaration submitted successfully.');
    }
}
