<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Declaration;
use App\Services\DeclarationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * DC03 Verify Declaration — Admin half. Reached from the Pengesahan tab of
 * a client record in Client Information. The Counsellor half is a separate
 * controller (Counsellor\DeclarationController) reached from their own
 * appointment review screen; both delegate the actual transition to
 * DeclarationService.
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
            // A correction request without a reason gives the client nothing
            // to act on, so the note is required here (unlike on verify).
            'note' => ['required', 'string', 'max:1000'],
        ]);

        $this->declarations->requestCorrection($declaration, $request->user(), $data['note']);

        return back()->with('success', 'Correction requested. The client can resubmit their declaration.');
    }
}
