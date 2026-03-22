import React, { useState } from 'react';

// Types for report session
interface ReportSession {
  sessionNo: number;
  date: string;
  slot: string;
  startTime: string;
  endTime: string;
  // Individual fields
  goal?: string;
  issues?: string;
  family?: string;
  history?: string;
  selfHarm?: string;
  selfHarmSince?: string;
  // Group fields
  topic?: string;
  groupType?: string;
  groupBackground?: string;
  groupProgress?: string;
  groupSummary?: string;
}

interface ReportModalProps {
  appointment: any;
  onClose: () => void;
}

const initialIndividualSession = (sessionNo: number, date: string, slot: string): ReportSession => ({
  sessionNo,
  date,
  slot,
  startTime: '',
  endTime: '',
  goal: '',
  issues: '',
  family: '',
  history: '',
  selfHarm: '',
  selfHarmSince: '',
});

const initialGroupSession = (sessionNo: number, date: string, slot: string): ReportSession => ({
  sessionNo,
  date,
  slot,
  startTime: '',
  endTime: '',
  topic: '',
  groupType: '',
  groupBackground: '',
  groupProgress: '',
  groupSummary: '',
});

export default function ReportModal({ appointment, onClose }: ReportModalProps) {
  const [sessions, setSessions] = useState<ReportSession[]>([
    appointment.sessionMode === 'group'
      ? initialGroupSession(1, appointment.date, appointment.slot)
      : initialIndividualSession(1, appointment.date, appointment.slot),
  ]);
  const [editingIndex, setEditingIndex] = useState(0);

  const handleAddSession = () => {
    const nextNo = sessions.length + 1;
    setSessions([
      ...sessions,
      appointment.sessionMode === 'group'
        ? initialGroupSession(nextNo, appointment.date, appointment.slot)
        : initialIndividualSession(nextNo, appointment.date, appointment.slot),
    ]);
    setEditingIndex(sessions.length);
  };

  const handleChange = (field: keyof ReportSession, value: string) => {
    setSessions((current) =>
      current.map((s, i) =>
        i === editingIndex ? { ...s, [field]: value } : s
      )
    );
  };

  const session = sessions[editingIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-300 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Laporan Sesi {appointment.sessionMode === 'group' ? 'Berkelompok' : 'Individu'}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Tutup
          </button>
        </div>
        <div className="mb-2 flex flex-wrap gap-2">
          {sessions.map((s, i) => (
            <button
              key={i}
              className={`rounded px-2 py-1 text-xs font-semibold border ${i === editingIndex ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300'}`}
              onClick={() => setEditingIndex(i)}
            >
              Sesi {s.sessionNo}
            </button>
          ))}
          <button
            type="button"
            className="rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700 border border-green-600"
            onClick={handleAddSession}
          >
            + Add Session
          </button>
        </div>
        <form className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs font-medium text-gray-700">No. Rujukan Sesi
              <input type="text" value={session.sessionNo} disabled className="w-full rounded border px-2 py-1 text-xs" />
            </label>
            <label className="text-xs font-medium text-gray-700">Tarikh Temujanji
              <input type="date" value={session.date} onChange={e => handleChange('date', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
            </label>
            <label className="text-xs font-medium text-gray-700">Slot
              <input type="text" value={session.slot} onChange={e => handleChange('slot', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
            </label>
            <label className="text-xs font-medium text-gray-700">Masa Mula
              <input type="time" value={session.startTime} onChange={e => handleChange('startTime', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
            </label>
            <label className="text-xs font-medium text-gray-700">Masa Tamat
              <input type="time" value={session.endTime} onChange={e => handleChange('endTime', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
            </label>
          </div>
          {appointment.sessionMode === 'group' ? (
            <>
              <label className="block text-xs font-medium text-gray-700">Tema / Topik
                <input type="text" value={session.topic || ''} onChange={e => handleChange('topic', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Jenis Kelompok
                <input type="text" value={session.groupType || ''} onChange={e => handleChange('groupType', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Latar Belakang Isu/Masalah
                <textarea value={session.groupBackground || ''} onChange={e => handleChange('groupBackground', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Perkembangan Kelompok
                <textarea value={session.groupProgress || ''} onChange={e => handleChange('groupProgress', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Rumusan dan Cadangan
                <textarea value={session.groupSummary || ''} onChange={e => handleChange('groupSummary', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
            </>
          ) : (
            <>
              <label className="block text-xs font-medium text-gray-700">Matlamat sesi kaunseling (kepada klien)
                <textarea value={session.goal || ''} onChange={e => handleChange('goal', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Latarbelakang isu / masalah yang dikemukakan
                <textarea value={session.issues || ''} onChange={e => handleChange('issues', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Hubungan dengan ahli keluarga/ibu bapa/adik beradik/pasangan/anak
                <textarea value={session.family || ''} onChange={e => handleChange('family', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Sejarah mencederakan diri
                <input type="text" value={session.history || ''} onChange={e => handleChange('history', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Berapa kali mencederakan diri?
                <input type="text" value={session.selfHarm || ''} onChange={e => handleChange('selfHarm', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
              <label className="block text-xs font-medium text-gray-700">Semenjak bila perlakuan mencederakan diri?
                <input type="text" value={session.selfHarmSince || ''} onChange={e => handleChange('selfHarmSince', e.target.value)} className="w-full rounded border px-2 py-1 text-xs" />
              </label>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
