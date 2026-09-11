<?php

namespace App\Http\Controllers\Counsellor;

use App\Http\Controllers\Controller;
use App\Models\Declaration;
use App\Services\DeclarationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * DC03 Verify Declaration — Counsellor half. The use case names Admin and
 * Counsellor as verifiers, but only Admin has a Client Information page, so
 * a counsellor reaches a client's declaration from the appointment they are
 * reviewing: the client's profile declaration is shown inside the
 * appointment detail modal.
 *
 * Same transitions as the Admin half, delegated to DeclarationService so
 * the two roles can't drift apart.
 */
class DeclarationController extends Controller
{
    public function __construct(private readonly DeclarationService $declarations) {}

    public function verify(Request $request, Declaration $declaration): RedirectResponse
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $this->declarations->verify($declaration, $request->user(), $data['note'] ?? null);

        return back()->with('success', 'Declaration verified.');
    }

    public function requestCorrection(Request $request, Declaration $declaration): RedirectResponse
    {
        $data = $request->validate([
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $this->declarations->requestCorrection($declaration, $request->user(), $data['note']);

        return back()->with('success', 'Correction requested. The client can resubmit their declaration.');
    }
}
