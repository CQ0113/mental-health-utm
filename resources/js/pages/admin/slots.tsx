import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import CounsellorLayout from '@/components/counsellor/Layout';
import {
    adminManagedSchedule,
    getAdminManagedSchedule,
    saveAdminManagedSchedule,
} from '@/lib/psycare-admin-slots';
import type { AdminScheduleDay, SessionType } from '@/lib/psycare-admin-slots';

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

export default function AdminSlotsPage() {
    const [schedule, setSchedule] = useState<AdminScheduleDay[]>(() => getAdminManagedSchedule());
    const [selectedScheduleDate, setSelectedScheduleDate] = useState(
        getAdminManagedSchedule()[0]?.date ?? '2026-03-11',
    );
    const [slotStartTime, setSlotStartTime] = useState('09:00');
    const [slotEndTime, setSlotEndTime] = useState('10:00');
    const [slotCounselor, setSlotCounselor] = useState('Pn. Aisyah Rahman');
    const [allowPhysical, setAllowPhysical] = useState(true);
    const [allowOnline, setAllowOnline] = useState(true);
    const [bulkStartDate, setBulkStartDate] = useState('2026-03-01');
    const [bulkEndDate, setBulkEndDate] = useState('2026-06-30');
    const [bulkTemplate, setBulkTemplate] = useState<BulkTemplateKey>('morning');
    const [bulkCounselor, setBulkCounselor] = useState('Pn. Aisyah Rahman');
    const [bulkAllowPhysical, setBulkAllowPhysical] = useState(true);
    const [bulkAllowOnline, setBulkAllowOnline] = useState(true);
    const [bulkReplaceExisting, setBulkReplaceExisting] = useState(true);
    const [bulkWeekdays, setBulkWeekdays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [csvReplaceExisting, setCsvReplaceExisting] = useState(false);
    const [flashMessage, setFlashMessage] = useState('');

    const selectedScheduleDay = useMemo(
        () => schedule.find((day) => day.date === selectedScheduleDate),
        [schedule, selectedScheduleDate],
    );

    const ensureScheduleDayExists = (dateValue: string) => {
        const hasDay = schedule.some((day) => day.date === dateValue);

        if (hasDay) {
            return;
        }

        setSchedule((current) =>
            [...current, { date: dateValue, slots: [] }].sort((first, second) =>
                first.date.localeCompare(second.date),
            ),
        );
    };

    const buildSlotLabel = (startTime: string, endTime: string, index: number) => {
        const toDisplayTime = (timeValue: string) => {
            const [hours, minutes] = timeValue.split(':').map((value) => Number.parseInt(value, 10));
            const period = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 === 0 ? 12 : hours % 12;

            return `${`${hour12}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')} ${period}`;
        };

        return `SLOT ${index + 1} (${toDisplayTime(startTime)} - ${toDisplayTime(endTime)})`;
    };

    const handleAddSlot = () => {
        ensureScheduleDayExists(selectedScheduleDate);

        const allowedSessionTypes: SessionType[] = [
            ...(allowPhysical ? ['physical' as const] : []),
            ...(allowOnline ? ['online' as const] : []),
        ];

        if (allowedSessionTypes.length === 0) {
            setFlashMessage('Please enable at least one session type (physical or online).');
            return;
        }

        setSchedule((current) => {
            return current.map((day) => {
                if (day.date !== selectedScheduleDate) {
                    return day;
                }

                const nextSlotIndex = day.slots.length;
                const slotId = `SLT-${selectedScheduleDate.replaceAll('-', '')}-${nextSlotIndex + 1}`;

                return {
                    ...day,
                    slots: [
                        ...day.slots,
                        {
                            id: slotId,
                            label: buildSlotLabel(slotStartTime, slotEndTime, nextSlotIndex),
                            counselorName: slotCounselor,
                            allowedSessionTypes,
                        },
                    ],
                };
            });
        });

        setFlashMessage(`Slot added for ${formatDate(selectedScheduleDate)} (not yet saved).`);
    };

    const handleDeleteSlot = (slotId: string) => {
        setSchedule((current) =>
            current.map((day) => {
                if (day.date !== selectedScheduleDate) {
                    return day;
                }

                return {
                    ...day,
                    slots: day.slots.filter((slot) => slot.id !== slotId),
                };
            }),
        );

        setFlashMessage(`Slot ${slotId} removed (not yet saved).`);
    };

    const handleSaveSchedule = () => {
        saveAdminManagedSchedule(schedule);
        setFlashMessage('Appointment slot schedule saved successfully. Client booking will use this updated schedule.');
    };

    const handleToggleBulkWeekday = (weekdayValue: number) => {
        setBulkWeekdays((current) =>
            current.includes(weekdayValue)
                ? current.filter((dayValue) => dayValue !== weekdayValue)
                : [...current, weekdayValue].sort((first, second) => first - second),
        );
    };

    const handleGenerateBulkSlots = () => {
        if (bulkWeekdays.length === 0) {
            setFlashMessage('Please select at least one weekday for bulk generation.');
            return;
        }

        const allowedSessionTypes: SessionType[] = [
            ...(bulkAllowPhysical ? ['physical' as const] : []),
            ...(bulkAllowOnline ? ['online' as const] : []),
        ];

        if (allowedSessionTypes.length === 0) {
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
        let affectedDays = 0;
        let generatedSlots = 0;
        let firstAffectedDate = '';

        setSchedule((current) => {
            const scheduleMap = new Map(current.map((day) => [day.date, day]));

            for (
                const workingDate = new Date(start);
                workingDate.getTime() <= end.getTime();
                workingDate.setDate(workingDate.getDate() + 1)
            ) {
                const weekday = workingDate.getDay();

                if (!bulkWeekdays.includes(weekday)) {
                    continue;
                }

                const isoDate = toIsoDate(workingDate);
                const existingDay = scheduleMap.get(isoDate) ?? { date: isoDate, slots: [] };
                const baseSlots = bulkReplaceExisting ? [] : existingDay.slots;
                const nextSlotIndex = baseSlots.length;

                const generated = templateBlocks.map((block, index) => ({
                    id: `SLT-${isoDate.replaceAll('-', '')}-${nextSlotIndex + index + 1}`,
                    label: buildSlotLabel(block.start, block.end, nextSlotIndex + index),
                    counselorName: bulkCounselor,
                    allowedSessionTypes,
                }));

                scheduleMap.set(isoDate, {
                    date: isoDate,
                    slots: [...baseSlots, ...generated],
                });

                affectedDays += 1;
                generatedSlots += generated.length;

                if (!firstAffectedDate) {
                    firstAffectedDate = isoDate;
                }
            }

            return [...scheduleMap.values()].sort((first, second) =>
                first.date.localeCompare(second.date),
            );
        });

        if (affectedDays === 0) {
            setFlashMessage('No dates matched your bulk rule. Try a wider date range or more weekdays.');
            return;
        }

        if (firstAffectedDate) {
            setSelectedScheduleDate(firstAffectedDate);
        }

        setFlashMessage(
            `Bulk generation complete: ${generatedSlots} slots prepared across ${affectedDays} days (${bulkReplaceExisting ? 'replace mode' : 'append mode'}). Click Save Slot Changes to publish.`,
        );
    };

    const parseSessionTypesFromCsv = (value: string): SessionType[] => {
        const normalizedValues = value
            .split('|')
            .map((entry) => entry.trim().toLowerCase())
            .filter(Boolean);

        const sessionTypes: SessionType[] = [];

        if (normalizedValues.includes('physical')) {
            sessionTypes.push('physical');
        }

        if (normalizedValues.includes('online')) {
            sessionTypes.push('online');
        }

        return sessionTypes;
    };

    const handleCsvUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const content = await file.text();
        const lines = content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            setFlashMessage('CSV is empty. Please upload a file with slot rows.');
            event.target.value = '';
            return;
        }

        const hasHeader = lines[0].toLowerCase().includes('date');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        const parsedRows: Array<{
            date: string;
            start: string;
            end: string;
            counselor: string;
            allowedSessionTypes: SessionType[];
        }> = [];

        let skippedRows = 0;

        dataLines.forEach((line) => {
            const [date, start, end, counselorName, sessionTypesRaw] = line
                .split(',')
                .map((cell) => cell.trim());

            const isDateValid = Boolean(date?.match(/^\d{4}-\d{2}-\d{2}$/));
            const isStartTimeValid = Boolean(start?.match(/^\d{2}:\d{2}$/));
            const isEndTimeValid = Boolean(end?.match(/^\d{2}:\d{2}$/));
            const allowedSessionTypes = parseSessionTypesFromCsv(sessionTypesRaw ?? '');

            if (
                !isDateValid ||
                !isStartTimeValid ||
                !isEndTimeValid ||
                !counselorName ||
                allowedSessionTypes.length === 0
            ) {
                skippedRows += 1;
                return;
            }

            parsedRows.push({
                date,
                start,
                end,
                counselor: counselorName,
                allowedSessionTypes,
            });
        });

        if (parsedRows.length === 0) {
            setFlashMessage('No valid CSV rows found. Expected columns: date,start,end,counselor,sessionTypes');
            event.target.value = '';
            return;
        }

        const rowsByDate = parsedRows.reduce<Record<string, typeof parsedRows>>((accumulator, row) => {
            if (!accumulator[row.date]) {
                accumulator[row.date] = [];
            }

            accumulator[row.date].push(row);
            return accumulator;
        }, {});

        setSchedule((current) => {
            const scheduleMap = new Map(current.map((day) => [day.date, day]));

            Object.entries(rowsByDate).forEach(([date, rows]) => {
                const existingDay = scheduleMap.get(date) ?? { date, slots: [] };
                const baseSlots = csvReplaceExisting ? [] : existingDay.slots;

                const importedSlots = rows.map((row, index) => {
                    const slotIndex = baseSlots.length + index;
                    return {
                        id: `SLT-${date.replaceAll('-', '')}-${slotIndex + 1}`,
                        label: buildSlotLabel(row.start, row.end, slotIndex),
                        counselorName: row.counselor,
                        allowedSessionTypes: row.allowedSessionTypes,
                    };
                });

                scheduleMap.set(date, {
                    date,
                    slots: [...baseSlots, ...importedSlots],
                });
            });

            return [...scheduleMap.values()].sort((first, second) =>
                first.date.localeCompare(second.date),
            );
        });

        const firstDate = Object.keys(rowsByDate).sort((first, second) => first.localeCompare(second))[0];
        if (firstDate) {
            setSelectedScheduleDate(firstDate);
        }

        setFlashMessage(
            `CSV imported: ${parsedRows.length} rows across ${Object.keys(rowsByDate).length} dates (${csvReplaceExisting ? 'replace mode' : 'append mode'})${skippedRows > 0 ? `, skipped ${skippedRows} invalid row(s)` : ''}. Click Save Slot Changes to publish.`,
        );

        event.target.value = '';
    };

    const handleResetSchedule = () => {
        const resetSchedule = [...adminManagedSchedule].sort((first, second) =>
            first.date.localeCompare(second.date),
        );

        setSchedule(resetSchedule);
        setSelectedScheduleDate(resetSchedule[0]?.date ?? selectedScheduleDate);
        saveAdminManagedSchedule(resetSchedule);
        setFlashMessage('Slot schedule reset to default mock configuration.');
    };

    return (
        <>
            <Head title="Counsellor Slot Manager" />
            <CounsellorLayout
                title="Slot Manager"
                subtitle="Set appointment slots with one-by-one, bulk, or CSV workflow"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-base font-semibold text-gray-900">Appointment Slot Manager</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleResetSchedule}
                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Reset Default
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSchedule}
                                className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                            >
                                Save Slot Changes
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">Bulk Setup (Fast for 100+ days)</h3>
                            <button
                                type="button"
                                onClick={handleGenerateBulkSlots}
                                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black"
                            >
                                Generate Bulk Slots
                            </button>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                            <label className="space-y-1 text-sm xl:col-span-2">
                                <span className="font-medium text-gray-700">Start Date</span>
                                <input
                                    type="date"
                                    value={bulkStartDate}
                                    onChange={(event) => setBulkStartDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>
                            <label className="space-y-1 text-sm xl:col-span-2">
                                <span className="font-medium text-gray-700">End Date</span>
                                <input
                                    type="date"
                                    value={bulkEndDate}
                                    onChange={(event) => setBulkEndDate(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>
                            <label className="space-y-1 text-sm xl:col-span-2">
                                <span className="font-medium text-gray-700">Slot Template</span>
                                <select
                                    value={bulkTemplate}
                                    onChange={(event) => setBulkTemplate(event.target.value as BulkTemplateKey)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                >
                                    <option value="morning">Morning (2 slots)</option>
                                    <option value="afternoon">Afternoon (2 slots)</option>
                                    <option value="full-day">Full Day (4 slots)</option>
                                </select>
                            </label>

                            <label className="space-y-1 text-sm xl:col-span-3">
                                <span className="font-medium text-gray-700">Counsellor</span>
                                <input
                                    value={bulkCounselor}
                                    onChange={(event) => setBulkCounselor(event.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                />
                            </label>

                            <div className="space-y-1 text-sm xl:col-span-3">
                                <span className="font-medium text-gray-700">Weekdays</span>
                                <div className="flex flex-wrap gap-2">
                                    {weekdayOptions.map((weekday) => (
                                        <button
                                            key={weekday.value}
                                            type="button"
                                            onClick={() => handleToggleBulkWeekday(weekday.value)}
                                            className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${
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

                            <div className="flex items-center gap-4 xl:col-span-3">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={bulkAllowPhysical}
                                        onChange={(event) => setBulkAllowPhysical(event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                    />
                                    Physical
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={bulkAllowOnline}
                                        onChange={(event) => setBulkAllowOnline(event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                    />
                                    Online
                                </label>
                            </div>

                            <div className="xl:col-span-3">
                                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={bulkReplaceExisting}
                                        onChange={(event) => setBulkReplaceExisting(event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                    />
                                    Replace existing slots on matched dates (disable to append)
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">CSV Import (Fastest for large setup)</h3>
                        <p className="mt-1 text-xs text-gray-600">
                            CSV format: <span className="font-medium">date,start,end,counselor,sessionTypes</span> e.g.{' '}
                            <span className="font-medium">2026-04-01,09:00,10:00,Pn. Aisyah Rahman,physical|online</span>
                        </p>

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
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

                    <div className="mt-4 grid gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2 xl:grid-cols-6">
                        <label className="space-y-1 text-sm xl:col-span-2">
                            <span className="font-medium text-gray-700">Schedule Date</span>
                            <input
                                type="date"
                                value={selectedScheduleDate}
                                onChange={(event) => {
                                    setSelectedScheduleDate(event.target.value);
                                    ensureScheduleDayExists(event.target.value);
                                }}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">Start Time</span>
                            <input
                                type="time"
                                value={slotStartTime}
                                onChange={(event) => setSlotStartTime(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">End Time</span>
                            <input
                                type="time"
                                value={slotEndTime}
                                onChange={(event) => setSlotEndTime(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>
                        <label className="space-y-1 text-sm xl:col-span-2">
                            <span className="font-medium text-gray-700">Counsellor</span>
                            <input
                                value={slotCounselor}
                                onChange={(event) => setSlotCounselor(event.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                        </label>

                        <div className="flex items-end gap-4 xl:col-span-4">
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={allowPhysical}
                                    onChange={(event) => setAllowPhysical(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                />
                                Physical
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={allowOnline}
                                    onChange={(event) => setAllowOnline(event.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-200"
                                />
                                Online
                            </label>
                        </div>

                        <div className="xl:col-span-2 xl:flex xl:items-end xl:justify-end">
                            <button
                                type="button"
                                onClick={handleAddSlot}
                                className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black xl:w-auto"
                            >
                                Add Slot
                            </button>
                        </div>
                    </div>

                    <h2 className="mt-5 text-base font-semibold text-gray-900">Admin-Configured Slot Overview</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {schedule.slice(0, 6).map((day) => (
                            <div key={day.date} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <p className="text-sm font-semibold text-gray-900">{formatDate(day.date)}</p>
                                <p className="mt-1 text-xs text-gray-600">{day.slots.length} configured slots</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900">
                            Slots on {formatDate(selectedScheduleDate)}
                        </h3>
                        <div className="mt-3 space-y-2">
                            {selectedScheduleDay?.slots.length ? (
                                selectedScheduleDay.slots.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{slot.label}</p>
                                            <p className="mt-1 text-xs text-gray-600">
                                                {slot.counselorName} • {slot.allowedSessionTypes.join(' / ')}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteSlot(slot.id)}
                                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-600">No slots set for this date yet.</p>
                            )}
                        </div>
                    </div>
                </section>
            </CounsellorLayout>
        </>
    );
}
