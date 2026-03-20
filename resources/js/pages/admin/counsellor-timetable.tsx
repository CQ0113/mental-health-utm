import { Head } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import { adminRegisteredCounsellors } from '@/lib/admin-mock-data';
import {
    getAdminManagedSchedule,
    saveAdminManagedSchedule,
} from '@/lib/psycare-admin-slots';
import type { AdminScheduleDay, SessionType } from '@/lib/psycare-admin-slots';

const registeredCounsellors = [...adminRegisteredCounsellors];

const formatDate = (dateValue: string) =>
    new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });

const buildSlotLabel = (startTime: string, endTime: string, index: number) => {
    const toDisplayTime = (timeValue: string) => {
        const [hours, minutes] = timeValue.split(':').map((value) => Number.parseInt(value, 10));
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 === 0 ? 12 : hours % 12;

        return `${`${hour12}`.padStart(2, '0')}:${`${minutes}`.padStart(2, '0')} ${period}`;
    };

    return `SLOT ${index + 1} (${toDisplayTime(startTime)} - ${toDisplayTime(endTime)})`;
};

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AdminCounsellorTimetablePage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const [schedule, setSchedule] = useState<AdminScheduleDay[]>(() => getAdminManagedSchedule());
    const [selectedCounsellor, setSelectedCounsellor] = useState(registeredCounsellors[0]);
    const [selectedDate, setSelectedDate] = useState(getAdminManagedSchedule()[0]?.date ?? '2026-03-11');
    const [startTime, setStartTime] = useState('08:30');
    const [endTime, setEndTime] = useState('09:30');
    const [allowPhysical, setAllowPhysical] = useState(true);
    const [allowOnline, setAllowOnline] = useState(true);
    const [flashMessage, setFlashMessage] = useState('');
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    const selectedDateSlots = useMemo(() => {
        const day = schedule.find((entry) => entry.date === selectedDate);

        if (!day) {
            return [];
        }

        return day.slots.filter((slot) => slot.counselorName === selectedCounsellor);
    }, [schedule, selectedDate, selectedCounsellor]);

    const calendarDates = useMemo(() => {
        const daysInMonth = getDaysInMonth(calendarMonth);
        const firstDay = getFirstDayOfMonth(calendarMonth);
        const dates: Array<{ date: string | null; dayNumber: number | null; slotCount: number }> = [];

        // Add empty cells for days before the month starts
        for (let index = 0; index < firstDay; index += 1) {
            dates.push({ date: null, dayNumber: null, slotCount: 0 });
        }

        // Add dates for this month
        for (let day = 1; day <= daysInMonth; day += 1) {
            const month = `${calendarMonth.getMonth() + 1}`.padStart(2, '0');
            const dayStr = `${day}`.padStart(2, '0');
            const dateStr = `${calendarMonth.getFullYear()}-${month}-${dayStr}`;

            const dayData = schedule.find((s) => s.date === dateStr);
            const slotCount = dayData
                ? dayData.slots.filter((slot) => slot.counselorName === selectedCounsellor).length
                : 0;

            dates.push({ date: dateStr, dayNumber: day, slotCount });
        }

        return dates;
    }, [calendarMonth, schedule, selectedCounsellor]);

    const handlePrevMonth = () => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1));
    };

    const handleAddSlot = async () => {
        const allowedSessionTypes: SessionType[] = [
            ...(allowPhysical ? ['physical' as const] : []),
            ...(allowOnline ? ['online' as const] : []),
        ];

        if (!selectedDate || !startTime || !endTime) {
            setFlashMessage('Please complete date, start time, and end time.');
            return;
        }

        if (allowedSessionTypes.length === 0) {
            setFlashMessage('Please enable at least one session mode (physical/online).');
            return;
        }

        const approved = await confirm({
            title: 'Add Counsellor Slot',
            message: `Add slot for ${selectedCounsellor} on ${formatDate(selectedDate)}?`,
            confirmText: 'Add Slot',
        });

        if (!approved) {
            return;
        }

        setSchedule((current) => {
            const hasDay = current.some((day) => day.date === selectedDate);
            const baseSchedule = hasDay
                ? current
                : [...current, { date: selectedDate, slots: [] }].sort((first, second) =>
                      first.date.localeCompare(second.date),
                  );

            return baseSchedule.map((day) => {
                if (day.date !== selectedDate) {
                    return day;
                }

                const nextIndex = day.slots.length;
                const slotId = `SLT-${selectedDate.replaceAll('-', '')}-${nextIndex + 1}`;

                return {
                    ...day,
                    slots: [
                        ...day.slots,
                        {
                            id: slotId,
                            label: buildSlotLabel(startTime, endTime, nextIndex),
                            counselorName: selectedCounsellor,
                            allowedSessionTypes,
                        },
                    ],
                };
            });
        });

        setFlashMessage(`Slot added for ${selectedCounsellor} (not yet saved).`);
    };

    const handleRemoveSlot = async (slotId: string, dateValue: string) => {
        const approved = await confirm({
            title: 'Remove Slot',
            message: `Remove selected slot for ${selectedCounsellor} on ${formatDate(dateValue)}?`,
            confirmText: 'Remove Slot',
            tone: 'danger',
        });

        if (!approved) {
            return;
        }

        setSchedule((current) =>
            current.map((day) => {
                if (day.date !== dateValue) {
                    return day;
                }

                return {
                    ...day,
                    slots: day.slots.filter((slot) => slot.id !== slotId),
                };
            }),
        );

        setFlashMessage(`Slot removed for ${selectedCounsellor} (not yet saved).`);
    };

    const handleSaveTimetable = () => {
        saveAdminManagedSchedule(schedule);
        setFlashMessage('Counsellor timetable saved successfully.');
    };

    return (
        <>
            <Head title="Admin Counsellor Timetable" />
            <AdminLayout
                title="Counsellor Timetable"
                subtitle="Assign, review, and remove timetable slots per registered counsellor"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 lg:grid-cols-3">
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-900">Registered Counsellors</h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Select a counsellor to manage service slots.
                            </p>

                            <div className="mt-3 space-y-2">
                                {registeredCounsellors.map((counsellor) => (
                                    <button
                                        key={counsellor}
                                        type="button"
                                        onClick={() => setSelectedCounsellor(counsellor)}
                                        className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                                            selectedCounsellor === counsellor
                                                ? 'border-red-700 bg-red-700 text-white'
                                                : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {counsellor}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 lg:col-span-2">
                            <h3 className="text-sm font-semibold text-gray-900">Tambah Jadual PPsi</h3>
                            <p className="mt-1 text-xs text-gray-600">
                                Selected counsellor: <span className="font-semibold">{selectedCounsellor}</span>
                            </p>

                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                                <label className="space-y-1 text-sm">
                                    <span className="font-medium text-gray-700">Tarikh</span>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(event) => setSelectedDate(event.target.value)}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                    />
                                </label>

                                <div className="grid grid-cols-2 gap-2">
                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">Mula</span>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(event) => setStartTime(event.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>
                                    <label className="space-y-1 text-sm">
                                        <span className="font-medium text-gray-700">Tamat</span>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(event) => setEndTime(event.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-700">
                                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={allowPhysical}
                                        onChange={(event) => setAllowPhysical(event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-700"
                                    />
                                    <span>Physical</span>
                                </label>
                                <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                                    <input
                                        type="checkbox"
                                        checked={allowOnline}
                                        onChange={(event) => setAllowOnline(event.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-red-800 focus:ring-red-700"
                                    />
                                    <span>Online</span>
                                </label>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleAddSlot}
                                    className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                >
                                    Add Slot
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveTimetable}
                                    className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                >
                                    Save Timetable Changes
                                </button>
                            </div>

                            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
                                <p className="text-xs font-semibold uppercase text-gray-500">
                                    Slot on Selected Date ({selectedDate ? formatDate(selectedDate) : '-'})
                                </p>
                                {selectedDateSlots.length === 0 ? (
                                    <p className="mt-2 text-sm text-gray-600">No slot assigned for this date.</p>
                                ) : (
                                    <ul className="mt-2 space-y-2 text-sm">
                                        {selectedDateSlots.map((slot) => (
                                            <li
                                                key={slot.id}
                                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">{slot.label}</p>
                                                    <p className="text-xs text-gray-600">
                                                        Mode: {slot.allowedSessionTypes.join(' / ')}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSlot(slot.id, selectedDate)}
                                                    className="rounded-md border border-red-300 bg-white px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900">
                                {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                            </h3>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={handlePrevMonth}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    ← Prev
                                </button>
                                <button
                                    type="button"
                                    onClick={handleNextMonth}
                                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-7 gap-2">
                            {dayNames.map((dayName) => (
                                <div key={dayName} className="text-center text-xs font-semibold text-gray-600">
                                    {dayName}
                                </div>
                            ))}

                            {calendarDates.map((dateEntry, index) => {
                                if (dateEntry.date === null) {
                                    return (
                                        <div
                                            key={`empty-${index}`}
                                            className="aspect-square rounded-lg bg-gray-100 p-2"
                                        />
                                    );
                                }

                                const isSelected = dateEntry.date === selectedDate;
                                const hasSlots = dateEntry.slotCount > 0;

                                return (
                                    <button
                                        key={dateEntry.date}
                                        type="button"
                                        onClick={() => setSelectedDate(dateEntry.date!)}
                                        className={`aspect-square rounded-lg border-2 p-2 transition ${
                                            isSelected
                                                ? 'border-red-800 bg-red-50'
                                                : hasSlots
                                                  ? 'border-red-300 bg-red-50 hover:border-red-500'
                                                  : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                    >
                                        <div className="flex h-full flex-col items-center justify-center text-center">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {dateEntry.dayNumber}
                                            </span>
                                            {hasSlots && (
                                                <span className="mt-1 inline-block h-2 w-2 rounded-full bg-red-800" />
                                            )}
                                            {dateEntry.slotCount > 0 && (
                                                <span className="text-xs text-gray-600">{dateEntry.slotCount} slot{dateEntry.slotCount > 1 ? 's' : ''}</span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
