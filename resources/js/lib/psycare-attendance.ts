import { pastAppointments } from '@/lib/psycare-appointment-records';
import { adminPortalMockData } from '@/lib/psycare-data';

export type AttendanceStatus = 'pending' | 'present' | 'absent' | 'excused';
export type SessionMode = 'individual' | 'group';

export type AttendanceParticipant = {
    id: string;
    name: string;
    status: AttendanceStatus;
};

export type AttendanceSession = {
    appointmentRef: string;
    sessionMode: SessionMode;
    participants: AttendanceParticipant[];
    updatedAt: string;
};

export const ATTENDANCE_STORAGE_KEY = 'psycare.appointment.attendance';
export const ATTENDANCE_UPDATED_EVENT = 'psycare:attendance-updated';

const isBrowser = typeof window !== 'undefined';

const normalizeParticipant = (
    participant: Partial<AttendanceParticipant> | null | undefined,
    fallbackIndex: number,
): AttendanceParticipant => ({
    id: participant?.id ?? `p-${fallbackIndex + 1}`,
    name: (participant?.name ?? '').trim() || `Participant ${fallbackIndex + 1}`,
    status: participant?.status ?? 'pending',
});

const normalizeSession = (
    session: Partial<AttendanceSession> | null | undefined,
    fallbackRef: string,
): AttendanceSession => {
    const participants = Array.isArray(session?.participants)
        ? session.participants.map((participant, index) => normalizeParticipant(participant, index))
        : [];

    return {
        appointmentRef: (session?.appointmentRef ?? fallbackRef).trim() || fallbackRef,
        sessionMode: session?.sessionMode === 'group' ? 'group' : 'individual',
        participants: participants.length > 0 ? participants : [normalizeParticipant(undefined, 0)],
        updatedAt: session?.updatedAt ?? new Date().toISOString(),
    };
};

const getDefaultSessions = (): AttendanceSession[] => {
    const counsellorSeeds = pastAppointments.map((appointment) =>
        normalizeSession(
            {
                appointmentRef: appointment.referenceNo,
                sessionMode: 'individual',
                participants: [
                    {
                        id: `p-${appointment.referenceNo}-1`,
                        name: 'Assigned Client',
                        status: 'pending',
                    },
                ],
            },
            appointment.referenceNo,
        ),
    );

    const adminSeeds = adminPortalMockData.appointmentRequests.map((request) =>
        normalizeSession(
            {
                appointmentRef: request.id,
                sessionMode: 'individual',
                participants: [
                    {
                        id: `p-${request.id}-1`,
                        name: request.clientName,
                        status: 'pending',
                    },
                ],
            },
            request.id,
        ),
    );

    const merged = new Map<string, AttendanceSession>();
    [...counsellorSeeds, ...adminSeeds].forEach((session) => {
        merged.set(session.appointmentRef, session);
    });

    return [...merged.values()];
};

export const getAttendanceSessions = (): AttendanceSession[] => {
    if (!isBrowser) {
        return getDefaultSessions();
    }

    const rawValue = window.localStorage.getItem(ATTENDANCE_STORAGE_KEY);
    if (!rawValue) {
        return getDefaultSessions();
    }

    try {
        const parsed = JSON.parse(rawValue) as Partial<AttendanceSession>[];
        if (!Array.isArray(parsed)) {
            return getDefaultSessions();
        }

        return parsed.map((session) => normalizeSession(session, session?.appointmentRef ?? 'UNKNOWN'));
    } catch {
        return getDefaultSessions();
    }
};

export const getAttendanceSessionByRef = (
    appointmentRef: string,
    fallbackClientName = 'Assigned Client',
): AttendanceSession => {
    const existing = getAttendanceSessions().find((session) => session.appointmentRef === appointmentRef);

    if (existing) {
        return existing;
    }

    return normalizeSession(
        {
            appointmentRef,
            sessionMode: 'individual',
            participants: [
                {
                    id: `p-${appointmentRef}-1`,
                    name: fallbackClientName,
                    status: 'pending',
                },
            ],
        },
        appointmentRef,
    );
};

export const upsertAttendanceSession = (nextSession: AttendanceSession) => {
    if (!isBrowser) {
        return;
    }

    const current = getAttendanceSessions();
    const normalizedNext = normalizeSession(nextSession, nextSession.appointmentRef);
    const withoutCurrent = current.filter((session) => session.appointmentRef !== normalizedNext.appointmentRef);
    const nextList = [...withoutCurrent, normalizedNext];

    window.localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(nextList));
    window.dispatchEvent(new CustomEvent(ATTENDANCE_UPDATED_EVENT));
};
