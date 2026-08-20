import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import AdminLayout from '@/components/admin/Layout';

type SessionType = 'physical' | 'online';

type Counsellor = { id: string; name: string };
type Location = { id: string; name: string };

type ServerSlot = {
    id: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    label: string;
    counsellorId: string | null;
    counsellorName: string;
    locationId: string | null;
    locationName: string;
    capacity: number;
    bookedCount: number;
    sessionTypes: SessionType[];
};

type DraftSlot = {
    tempId: string;
    slotDate: string;
    startTime: string;
    endTime: string;
    counsellorId: string;
    counsellorName: string;
    locationId: string;
    locationName: string;
    sessionTypes: SessionType[];
};

type PageProps = {
    slots: ServerSlot[];
    counsellors: Counsellor[];
    locations: Location[];
};

const formatDate = (dateValue: string) =>
    new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const toIsoDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1);

type BulkTemplateKey = 'morning' | 'afternoon' | 'full-day';

const bulkTemplateDefinitions: Record<BulkTemplateKey, Array<{ start: string; end: string }>> = {
    morning: [
        { start: '09:00', end: '10:00' },
        { start: '10:30', end: '11:30' },
    ],
    afternoon: [
        { start: '13:30', end: '14:30' },
        { start: '15:00', end: '16:00' },
    ],
    'full-day': [
        { start: '09:00', end: '10:00' },
        { start: '10:30', end: '11:30' },
        { start: '13:30', end: '14:30' },
        { start: '15:00', end: '16:00' },
    ],
};

const weekdayOptions = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' },
];

type ToolTab = 'add' | 'bulk' | 'csv';

const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100';

const ALL_COUNSELLORS = 'all';

/**
 * Admin's Slot Manager — manages every counsellor's slots. Deliberately a
 * separate page from Counsellor\SlotController's `counsellor/slots.tsx`
 * (which only manages the logged-in counsellor's own), not one page
 * branching on role: the two have genuinely different jobs — this one
 * needs a counsellor picker on every action and a way to focus the
 * calendar on one counsellor at a time, neither of which the counsellor
 * page needs at all.
 */
export default function AdminSlotsPage({ slots, counsellors, locations }: PageProps) {
    const [pendingNewSlots, setPendingNewSlots] = useState<DraftSlot[]>([]);
    const [pendingDeletedIds, setPendingDeletedIds] = useState<string[]>([]);
    const [tempIdCounter, setTempIdCounter] = useState(1);

    const initialDate = slots[0]?.slotDate ?? toIsoDate(new Date());
    const [selectedScheduleDate, setSelectedScheduleDate] = useState(initialDate);
    const [calendarMonth, setCalendarMonth] = useState(() => startOfMonth(new Date(`${initialDate}T00:00:00`)));
    const [viewCounsellorId, setViewCounsellorId] = useState(ALL_COUNSELLORS);

    const [activeTool, setActiveTool] = useState<ToolTab>('add');

    const [slotStartTime, setSlotStartTime] = useState('09:00');
    const [slotEndTime, setSlotEndTime] = useState('10:00');
    const [slotCounsellorId, setSlotCounsellorId] = useState(counsellors[0]?.id ?? '');
    const [slotLocationId, setSlotLocationId] = useState(locations[0]?.id ?? '');
    const [allowPhysical, setAllowPhysical] = useState(true);
    const [allowOnline, setAllowOnline] = useState(true);

    const [bulkStartDate, setBulkStartDate] = useState(toIsoDate(new Date()));
    const [bulkEndDate, setBulkEndDate] = useState(toIsoDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));
    const [bulkTemplate, setBulkTemplate] = useState<BulkTemplateKey>('morning');
    const [bulkCounsellorId, setBulkCounsellorId] = useState(counsellors[0]?.id ?? '');
    const [bulkLocationId, setBulkLocationId] = useState(locations[0]?.id ?? '');
    const [bulkAllowPhysical, setBulkAllowPhysical] = useState(true);
    const [bulkAllowOnline, setBulkAllowOnline] = useState(true);
    const [bulkReplaceExisting, setBulkReplaceExisting] = useState(true);
    const [bulkWeekdays, setBulkWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);

    const [csvReplaceExisting, setCsvReplaceExisting] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const counsellorName = (id: string) => counsellors.find((c) => c.id === id)?.name ?? '-';
    const locationName = (id: string) => locations.find((l) => l.id === id)?.name ?? '-';

    const nextTempId = () => {
        const id = `NEW-${tempIdCounter}`;
        setTempIdCounter((current) => current + 1);
        return id;
    };

    // Merge server slots (minus pending deletions) with pending new drafts,
    // grouped by date — this is the "not yet saved" draft schedule AS04
    // describes. Filtered to the counsellor currently focused in the
    // calendar, if any.
    const scheduleByDate = useMemo(() => {
        const map = new Map<string, Array<{ key: string; isDraft: boolean; slot: ServerSlot | DraftSlot }>>();
        const matchesFilter = (counsellorId: string | null) =>
            viewCounsellorId === ALL_COUNSELLORS || counsellorId === viewCounsellorId;

        slots
            .filter((slot) => !pendingDeletedIds.includes(slot.id) && matchesFilter(slot.counsellorId))
            .forEach((slot) => {
                const bucket = map.get(slot.slotDate) ?? [];
                bucket.push({ key: slot.id, isDraft: false, slot });
                map.set(slot.slotDate, bucket);
            });

        pendingNewSlots
            .filter((slot) => matchesFilter(slot.counsellorId))
            .forEach((slot) => {
                const bucket = map.get(slot.slotDate) ?? [];
                bucket.push({ key: slot.tempId, isDraft: true, slot });
                map.set(slot.slotDate, bucket);
            });

        map.forEach((bucket) => bucket.sort((a, b) => a.slot.startTime.localeCompare(b.slot.startTime)));

        return map;
    }, [slots, pendingNewSlots, pendingDeletedIds, viewCounsellorId]);

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(calendarMonth);
        const firstGridDate = new Date(monthStart);
        firstGridDate.setDate(monthStart.getDate() - monthStart.getDay());

        return Array.from({ length: 42 }, (_, index) => {
            const date = new Date(firstGridDate);
            date.setDate(firstGridDate.getDate() + index);
            const isoDate = toIsoDate(date);
            const bucket = scheduleByDate.get(isoDate) ?? [];

            return {
                isoDate,
                day: date.getDate(),
                isCurrentMonth: date.getMonth() === calendarMonth.getMonth(),
                isToday: isoDate === toIsoDate(new Date()),
                total: bucket.length,
                draftCount: bucket.filter((item) => item.isDraft).length,
            };
        });
    }, [calendarMonth, scheduleByDate]);

    const selectedDaySlots = scheduleByDate.get(selectedScheduleDate) ?? [];
    const unsavedCount = pendingNewSlots.length + pendingDeletedIds.length;

    const monthLabel = calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const totalVisibleSlots = [...scheduleByDate.values()].reduce((sum, bucket) => sum + bucket.length, 0);

    const selectDate = (isoDate: string) => {
        setSelectedScheduleDate(isoDate);
        setCalendarMonth(startOfMonth(new Date(`${isoDate}T00:00:00`)));
    };

    const handleAddSlot = () => {
        const sessionTypes: SessionType[] = [
            ...(allowPhysical ? ['physical' as const] : []),
            ...(allowOnline ? ['online' as const] : []),
        ];

        if (sessionTypes.length === 0) {
            setFlashMessage('Please enable at least one session type (physical or online).');
            return;
        }

        if (slotEndTime <= slotStartTime) {
            setFlashMessage('Invalid slot time. End time must be after start time.');
            return;
        }

        setPendingNewSlots((current) => [
            ...current,
            {
                tempId: nextTempId(),
                slotDate: selectedScheduleDate,
                startTime: slotStartTime,
                endTime: slotEndTime,
                counsellorId: slotCounsellorId,
                counsellorName: counsellorName(slotCounsellorId),
                locationId: slotLocationId,
                locationName: locationName(slotLocationId),
                sessionTypes,
            },
        ]);

        setFlashMessage(`Slot added for ${counsellorName(slotCounsellorId)} on ${formatDate(selectedScheduleDate)} (not yet saved).`);
    };

    const handleDeleteSlot = (item: { key: string; isDraft: boolean }) => {
        if (item.isDraft) {
            setPendingNewSlots((current) => current.filter((slot) => slot.tempId !== item.key));
        } else {
            setPendingDeletedIds((current) => [...current, item.key]);
        }

        setFlashMessage('Slot removed (not yet saved).');
    };

    const handleToggleBulkWeekday = (weekdayValue: number) => {
        setBulkWeekdays((current) =>
            current.includes(weekdayValue)
                ? current.filter((dayValue) => dayValue !== weekdayValue)
                : [...current, weekdayValue].sort((a, b) => a - b),
        );
    };

    const handleGenerateBulkSlots = () => {
        if (bulkWeekdays.length === 0) {
            setFlashMessage('Please select at least one weekday for bulk generation.');
            return;
        }

        const sessionTypes: SessionType[] = [
            ...(bulkAllowPhysical ? ['physical' as const] : []),
            ...(bulkAllowOnline ? ['online' as const] : []),
        ];

        if (sessionTypes.length === 0) {
            setFlashMessage('Please enable at least one session type for bulk generation.');
            return;
        }

        const start = new Date(`${bulkStartDate}T00:00:00`);
        const end = new Date(`${bulkEndDate}T00:00:00`);

        if (start.getTime() > end.getTime()) {
            setFlashMessage('Bulk start date must be earlier than or equal to end date.');
            return;
        }

        const templateBlocks = bulkTemplateDefinitions[bulkTemplate];
        const generatedDrafts: DraftSlot[] = [];
        const datesToReplace: string[] = [];
        let affectedDays = 0;

        for (
            const workingDate = new Date(start);
            workingDate.getTime() <= end.getTime();
            workingDate.setDate(workingDate.getDate() + 1)
        ) {
            if (!bulkWeekdays.includes(workingDate.getDay())) {
                continue;
            }

            const isoDate = toIsoDate(workingDate);
            datesToReplace.push(isoDate);
            affectedDays += 1;

            templateBlocks.forEach((block) => {
                generatedDrafts.push({
                    tempId: nextTempId(),
                    slotDate: isoDate,
                    startTime: block.start,
                    endTime: block.end,
                    counsellorId: bulkCounsellorId,
                    counsellorName: counsellorName(bulkCounsellorId),
                    locationId: bulkLocationId,
                    locationName: locationName(bulkLocationId),
                    sessionTypes,
                });
            });
        }

        if (affectedDays === 0) {
            setFlashMessage('No dates matched your bulk rule. Try a wider date range or more weekdays.');
            return;
        }

        if (bulkReplaceExisting) {
            const dateSet = new Set(datesToReplace);
            const idsToDelete = slots
                .filter(
                    (slot) =>
                        dateSet.has(slot.slotDate) &&
                        slot.counsellorId === bulkCounsellorId &&
                        !pendingDeletedIds.includes(slot.id),
                )
                .map((slot) => slot.id);

            setPendingDeletedIds((current) => [...current, ...idsToDelete]);
            setPendingNewSlots((current) => [
                ...current.filter((slot) => !(dateSet.has(slot.slotDate) && slot.counsellorId === bulkCounsellorId)),
                ...generatedDrafts,
            ]);
        } else {
            setPendingNewSlots((current) => [...current, ...generatedDrafts]);
        }

        setViewCounsellorId(bulkCounsellorId);
        selectDate(datesToReplace[0]);
        setFlashMessage(
            `Bulk generation complete: ${generatedDrafts.length} slots prepared across ${affectedDays} days for ${counsellorName(bulkCounsellorId)} (${bulkReplaceExisting ? 'replace mode' : 'append mode'}). Click Save Slot Changes to publish.`,
        );
    };

    const parseSessionTypesFromCsv = (value: string): SessionType[] => {
        const normalized = value.split('|').map((v) => v.trim().toLowerCase()).filter(Boolean);
        const types: SessionType[] = [];

        if (normalized.includes('physical')) types.push('physical');
        if (normalized.includes('online')) types.push('online');

        return types;
    };

    const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const content = await file.text();
        const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

        if (lines.length === 0) {
            setFlashMessage('CSV is empty. Please upload a file with slot rows.');
            event.target.value = '';
            return;
        }

        const hasHeader = lines[0].toLowerCase().includes('date');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        const importedDrafts: DraftSlot[] = [];
        const datesImported = new Set<string>();
        let skippedRows = 0;

        dataLines.forEach((line) => {
            const [date, start, end, counselorNameRaw, sessionTypesRaw] = line.split(',').map((c) => c.trim());

            const isDateValid = Boolean(date?.match(/^\d{4}-\d{2}-\d{2}$/));
            const isStartValid = Boolean(start?.match(/^\d{2}:\d{2}$/));
            const isEndValid = Boolean(end?.match(/^\d{2}:\d{2}$/));
            const sessionTypes = parseSessionTypesFromCsv(sessionTypesRaw ?? '');
            const matchedCounsellor = counsellors.find(
                (c) => c.name.toLowerCase() === (counselorNameRaw ?? '').toLowerCase(),
            );

            if (!isDateValid || !isStartValid || !isEndValid || !matchedCounsellor || sessionTypes.length === 0) {
                skippedRows += 1;
                return;
            }

            datesImported.add(date);
            importedDrafts.push({
                tempId: nextTempId(),
                slotDate: date,
                startTime: start,
                endTime: end,
                counsellorId: matchedCounsellor.id,
                counsellorName: matchedCounsellor.name,
                locationId: locations[0]?.id ?? '',
                locationName: locations[0]?.name ?? '-',
                sessionTypes,
            });
        });

        if (importedDrafts.length === 0) {
            setFlashMessage('No valid CSV rows found. Expected columns: date,start,end,counselor,sessionTypes');
            event.target.value = '';
            return;
        }

        if (csvReplaceExisting) {
            const idsToDelete = slots
                .filter((slot) => datesImported.has(slot.slotDate) && !pendingDeletedIds.includes(slot.id))
                .map((slot) => slot.id);

            setPendingDeletedIds((current) => [...current, ...idsToDelete]);
            setPendingNewSlots((current) => [
                ...current.filter((slot) => !datesImported.has(slot.slotDate)),
                ...importedDrafts,
            ]);
        } else {
            setPendingNewSlots((current) => [...current, ...importedDrafts]);
        }

        setViewCounsellorId(ALL_COUNSELLORS);
        const firstDate = [...datesImported].sort()[0];
        if (firstDate) selectDate(firstDate);

        setFlashMessage(
            `CSV imported: ${importedDrafts.length} rows across ${datesImported.size} dates (${csvReplaceExisting ? 'replace mode' : 'append mode'})${skippedRows > 0 ? `, skipped ${skippedRows} invalid row(s)` : ''}. Click Save Slot Changes to publish.`,
        );

        event.target.value = '';
    };

    const handleSaveSchedule = () => {
        if (unsavedCount === 0) {
            setFlashMessage('No unsaved changes to publish.');
            return;
        }

        setIsSaving(true);

        router.post(
            '/admin/slots',
            {
                new_slots: pendingNewSlots.map((slot) => ({
                    slot_date: slot.slotDate,
                    start_time: slot.startTime,
                    end_time: slot.endTime,
                    counsellor_id: slot.counsellorId || null,
                    location_id: slot.locationId || null,
                    session_types: slot.sessionTypes,
                })),
                deleted_slot_ids: pendingDeletedIds,
                generation_method: 'manual',
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPendingNewSlots([]);
                    setPendingDeletedIds([]);
                    setFlashMessage('Appointment slot schedule saved successfully. Client booking will use this updated schedule.');
                },
                onError: () => {
                    setFlashMessage('Could not save slot changes — check for slot time conflicts on the affected dates.');
                },
                onFinish: () => setIsSaving(false),
            },
        );
    };

    const toolTabs: Array<{ key: ToolTab; label: string; hint: string }> = [
        { key: 'add', label: 'Add Slot', hint: 'One slot for one counsellor' },
        { key: 'bulk', label: 'Bulk Generate', hint: 'Repeat a template across a date range for one counsellor' },
        { key: 'csv', label: 'CSV Import', hint: 'Upload a prepared schedule covering multiple counsellors' },
    ];

    return (
        <>
            <Head title="Slot Manager" />
            <AdminLayout
                title="Slot Manager"
                subtitle="Manage appointment slots for every counsellor"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                {/* Header: status + save */}
                <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-gray-900">Appointment Slot Manager</h2>
                            <p className="mt-0.5 text-xs text-gray-600">
                                {totalVisibleSlots} upcoming slot{totalVisibleSlots === 1 ? '' : 's'}
                                {viewCounsellorId !== ALL_COUNSELLORS ? ` for ${counsellorName(viewCounsellorId)}` : ' across all counsellors'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {unsavedCount > 0 && (
                                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                    {unsavedCount} unsaved change{unsavedCount === 1 ? '' : 's'}
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={handleSaveSchedule}
                                disabled={isSaving || unsavedCount === 0}
                                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSaving ? 'Saving…' : 'Save Slot Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Tool tabs */}
                    <div className="mt-4 border-b border-gray-200">
                        <div className="flex gap-1">
                            {toolTabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setActiveTool(tab.key)}
                                    className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                                        activeTool === tab.key
                                            ? 'border border-b-0 border-gray-200 bg-gray-50 text-red-800'
                                            : 'text-gray-500 hover:text-gray-800'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-b-lg border border-t-0 border-gray-200 bg-gray-50 p-4">
                        <p className="mb-3 text-xs text-gray-500">
                            {toolTabs.find((tab) => tab.key === activeTool)?.hint}
                        </p>

                        {activeTool === 'add' && (
                            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-6">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Schedule Date</span>
                                    <input
                                        type="date"
                                        value={selectedScheduleDate}
                                        onChange={(event) => selectDate(event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Start Time</span>
                                    <input
                                        type="time"
                                        value={slotStartTime}
                                        onChange={(event) => setSlotStartTime(event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">End Time</span>
                                    <input
                                        type="time"
                                        value={slotEndTime}
                                        onChange={(event) => setSlotEndTime(event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Counsellor</span>
                                    <select
                                        value={slotCounsellorId}
                                        onChange={(event) => setSlotCounsellorId(event.target.value)}
                                        className={inputClass}
                                    >
                                        {counsellors.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Location</span>
                                    <select
                                        value={slotLocationId}
                                        onChange={(event) => setSlotLocationId(event.target.value)}
                                        className={inputClass}
                                    >
                                        {locations.map((l) => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="flex items-center gap-3 pb-1 text-sm text-gray-700">
                                    <label className="inline-flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            checked={allowPhysical}
                                            onChange={(event) => setAllowPhysical(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Physical
                                    </label>
                                    <label className="inline-flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            checked={allowOnline}
                                            onChange={(event) => setAllowOnline(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Online
                                    </label>
                                </div>
                                <div className="xl:col-span-6">
                                    <button
                                        type="button"
                                        onClick={handleAddSlot}
                                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                                    >
                                        Add Slot to {formatDate(selectedScheduleDate)}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTool === 'bulk' && (
                            <div className="grid items-end gap-3 md:grid-cols-2 xl:grid-cols-4">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Start Date</span>
                                    <input
                                        type="date"
                                        value={bulkStartDate}
                                        onChange={(event) => setBulkStartDate(event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">End Date</span>
                                    <input
                                        type="date"
                                        value={bulkEndDate}
                                        onChange={(event) => setBulkEndDate(event.target.value)}
                                        className={inputClass}
                                    />
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Slot Template</span>
                                    <select
                                        value={bulkTemplate}
                                        onChange={(event) => setBulkTemplate(event.target.value as BulkTemplateKey)}
                                        className={inputClass}
                                    >
                                        <option value="morning">Morning (2 slots: 9–10, 10:30–11:30)</option>
                                        <option value="afternoon">Afternoon (2 slots: 1:30–2:30, 3–4)</option>
                                        <option value="full-day">Full Day (4 slots)</option>
                                    </select>
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Counsellor</span>
                                    <select
                                        value={bulkCounsellorId}
                                        onChange={(event) => setBulkCounsellorId(event.target.value)}
                                        className={inputClass}
                                    >
                                        {counsellors.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Location</span>
                                    <select
                                        value={bulkLocationId}
                                        onChange={(event) => setBulkLocationId(event.target.value)}
                                        className={inputClass}
                                    >
                                        {locations.map((l) => (
                                            <option key={l.id} value={l.id}>{l.name}</option>
                                        ))}
                                    </select>
                                </label>
                                <div className="space-y-1 text-sm md:col-span-2">
                                    <span className="font-medium text-gray-700">Weekdays</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {weekdayOptions.map((weekday) => (
                                            <button
                                                key={weekday.value}
                                                type="button"
                                                onClick={() => handleToggleBulkWeekday(weekday.value)}
                                                className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                                                    bulkWeekdays.includes(weekday.value)
                                                        ? 'border-red-800 bg-red-800 text-white'
                                                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                {weekday.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 md:col-span-2 xl:col-span-4">
                                    <label className="inline-flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            checked={bulkAllowPhysical}
                                            onChange={(event) => setBulkAllowPhysical(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Physical
                                    </label>
                                    <label className="inline-flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            checked={bulkAllowOnline}
                                            onChange={(event) => setBulkAllowOnline(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Online
                                    </label>
                                    <label className="inline-flex items-center gap-1.5">
                                        <input
                                            type="checkbox"
                                            checked={bulkReplaceExisting}
                                            onChange={(event) => setBulkReplaceExisting(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Replace existing slots on matched dates
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleGenerateBulkSlots}
                                        className="ml-auto rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black"
                                    >
                                        Generate Bulk Slots
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTool === 'csv' && (
                            <div className="space-y-3">
                                <p className="text-xs text-gray-600">
                                    Format: <span className="font-medium">date,start,end,counselor,sessionTypes</span>{' '}
                                    e.g.{' '}
                                    <span className="font-medium">
                                        2026-04-01,09:00,10:00,{counsellors[0]?.name ?? 'Dr. Aisha Rahman'},physical|online
                                    </span>{' '}
                                    — one file can cover multiple counsellors; each counsellor name must match an
                                    existing counsellor exactly. Blank + example templates are in the project's{' '}
                                    <span className="font-medium">template/</span> folder.
                                </p>
                                <div className="flex flex-wrap items-center gap-4">
                                    <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={csvReplaceExisting}
                                            onChange={(event) => setCsvReplaceExisting(event.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                        />
                                        Replace existing slots on imported dates
                                    </label>
                                    <input
                                        type="file"
                                        accept=".csv,text/csv"
                                        onChange={handleCsvUpload}
                                        className="block rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Calendar + day detail */}
                <section className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth((current) => addMonths(current, -1))}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    ‹
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCalendarMonth(startOfMonth(new Date()));
                                        setSelectedScheduleDate(toIsoDate(new Date()));
                                    }}
                                    className="rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Today
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setCalendarMonth((current) => addMonths(current, 1))}
                                    className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    ›
                                </button>
                            </div>
                        </div>

                        <label className="mt-3 block space-y-1 text-sm">
                            <span className="font-medium text-gray-700">View calendar for</span>
                            <select
                                value={viewCounsellorId}
                                onChange={(event) => setViewCounsellorId(event.target.value)}
                                className={inputClass}
                            >
                                <option value={ALL_COUNSELLORS}>All counsellors</option>
                                {counsellors.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </label>

                        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-600">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <span key={day} className="py-1">{day}</span>
                            ))}
                        </div>

                        <div className="mt-1 grid grid-cols-7 gap-1">
                            {calendarDays.map((day) => {
                                const isSelected = day.isoDate === selectedScheduleDate;

                                return (
                                    <button
                                        key={day.isoDate}
                                        type="button"
                                        onClick={() => setSelectedScheduleDate(day.isoDate)}
                                        className={`flex min-h-16 flex-col items-start gap-1 rounded-lg border p-1.5 text-left transition ${
                                            isSelected
                                                ? 'border-red-800 bg-red-50 ring-1 ring-red-200'
                                                : day.isCurrentMonth
                                                  ? 'border-gray-200 bg-white hover:border-red-300'
                                                  : 'border-gray-100 bg-gray-50 text-gray-400'
                                        }`}
                                    >
                                        <span
                                            className={`text-xs font-semibold ${
                                                day.isToday
                                                    ? 'flex h-5 w-5 items-center justify-center rounded-full bg-red-800 text-white'
                                                    : ''
                                            }`}
                                        >
                                            {day.day}
                                        </span>
                                        {day.total > 0 && (
                                            <span
                                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                                    day.draftCount > 0
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-teal-100 text-teal-800'
                                                }`}
                                            >
                                                {day.total} slot{day.total === 1 ? '' : 's'}
                                                {day.draftCount > 0 ? ' •' : ''}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-teal-100 ring-1 ring-teal-300" /> Saved slots
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-3 w-3 rounded bg-amber-100 ring-1 ring-amber-300" /> Has unsaved changes
                            </span>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900">
                            {formatDate(selectedScheduleDate)}
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-600">
                            {selectedDaySlots.length} slot{selectedDaySlots.length === 1 ? '' : 's'} on this date
                        </p>

                        <div className="mt-3 space-y-2">
                            {selectedDaySlots.length === 0 && (
                                <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500">
                                    No slots on this date yet.
                                    <br />
                                    Use <span className="font-semibold">Add Slot</span> above to create one.
                                </p>
                            )}

                            {selectedDaySlots.map((item) => {
                                const slot = item.slot;
                                const cName = item.isDraft
                                    ? (slot as DraftSlot).counsellorName
                                    : (slot as ServerSlot).counsellorName;
                                const booked = !item.isDraft ? (slot as ServerSlot).bookedCount : 0;
                                const capacity = !item.isDraft ? (slot as ServerSlot).capacity : 1;

                                return (
                                    <div
                                        key={item.key}
                                        className={`rounded-lg border p-3 ${
                                            item.isDraft ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {slot.startTime} – {slot.endTime}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-600">{cName}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteSlot(item)}
                                                className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                            {slot.sessionTypes.map((type) => (
                                                <span
                                                    key={type}
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                                        type === 'online'
                                                            ? 'bg-sky-100 text-sky-800'
                                                            : 'bg-emerald-100 text-emerald-800'
                                                    }`}
                                                >
                                                    {type}
                                                </span>
                                            ))}
                                            {item.isDraft ? (
                                                <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                                                    NOT YET SAVED
                                                </span>
                                            ) : (
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        booked >= capacity
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    {booked}/{capacity} booked
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </AdminLayout>
        </>
    );
}
