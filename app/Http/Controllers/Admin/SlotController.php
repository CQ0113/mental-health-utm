<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Counsellor;
use App\Models\CounsellingLocation;
use App\Services\SlotScheduleService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * AS04 Manage Slots / AS05 Bulk Generate Slots / AS06 Import CSV Template
 * — Admin half. An Admin manages every counsellor's slots. The
 * Counsellor half (Counsellor\SlotController) is a deliberately separate
 * controller and page — same underlying persistence (SlotScheduleService),
 * but a different scope and a different UI, not one page branching on role.
 */
class SlotController extends Controller
{
    public function __construct(private readonly SlotScheduleService $slots) {}

    public function index(): Response
    {
        return Inertia::render('admin/slots', [
            'slots' => $this->slots->presentUpcoming(null),
            'counsellors' => Counsellor::orderBy('name')->get(['id', 'name']),
            'locations' => CounsellingLocation::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function save(Request $request): RedirectResponse
    {
        $data = $request->validate($this->slots->validationRules());

        $this->slots->persist(
            $data['new_slots'] ?? [],
            $data['deleted_slot_ids'] ?? [],
            $data['generation_method'] ?? 'manual',
            $data['summary'] ?? null,
            $request->user()->id,
        );

        return back()->with('success', 'Appointment slot schedule saved successfully. Client booking will use this updated schedule.');
    }
}
