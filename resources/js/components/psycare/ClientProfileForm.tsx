import { useState } from 'react';
import { clientProfileMockSeed } from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';

type ProfileTab = 'personal' | 'study' | 'marriage' | 'health' | 'confirmation';

const tabs: ProfileTab[] = [
    'personal',
    'study',
    'marriage',
    'health',
    'confirmation',
];

export default function ClientProfileForm() {
    const language = usePsycareLanguage();
    const [activeTab, setActiveTab] =
        useState<ProfileTab>('personal');
    const profile = clientProfileMockSeed;

    const copy =
        language === 'en'
            ? {
                  title: 'Client Information Form',
                  tabs: {
                      personal: 'Personal Information',
                      study: 'Study Information',
                      marriage: 'Marriage Information',
                      health: 'Health History',
                      confirmation: 'Confirmation',
                  },
                  fullName: 'Full Name',
                  icNo: 'Identification Number',
                  currentAddress: 'Current Address',
                  matricNo: 'Matric No.',
                  program: 'Program',
                  faculty: 'Faculty',
                  maritalStatus: 'Marital Status',
                  dependents: 'Number of Dependents',
                  treatmentHistory: 'Psychology/Psychiatry Treatment History',
                  medications: 'Current Medications',
                  treatmentPlaceholder: 'State treatment history if any',
                  medicationsPlaceholder: 'State current medications',
                  declaration:
                      'I confirm that all information provided is true.',
                  lockedTitle: 'Profile Locked',
                  lockedDescription:
                      'This information is locked. Please contact UTM Counselling Unit for verification and update requests.',
                  single: 'Single',
                  married: 'Married',
                  divorced: 'Divorced',
              }
            : {
                  title: 'Borang Maklumat Klien',
                  tabs: {
                      personal: 'Maklumat Peribadi',
                      study: 'Maklumat Pengajian',
                      marriage: 'Maklumat Perkahwinan',
                      health: 'Sejarah Kesihatan',
                      confirmation: 'Pengesahan',
                  },
                  fullName: 'Nama Penuh',
                  icNo: 'No. Kad Pengenalan',
                  currentAddress: 'Alamat Semasa',
                  matricNo: 'No. Matrik',
                  program: 'Program',
                  faculty: 'Fakulti',
                  maritalStatus: 'Status Perkahwinan',
                  dependents: 'Bilangan Tanggungan',
                  treatmentHistory: 'Sejarah rawatan psikologi/psikiatri',
                  medications: 'Ubat-ubatan semasa',
                  treatmentPlaceholder: 'Nyatakan sejarah rawatan jika ada',
                  medicationsPlaceholder: 'Nyatakan ubat yang sedang diambil',
                  declaration:
                      'Saya mengesahkan bahawa semua maklumat yang diberikan adalah benar.',
                  lockedTitle: 'Profil Dikunci',
                  lockedDescription:
                      'Maklumat ini dikunci. Sila hubungi Unit Kaunseling UTM untuk pengesahan dan permintaan kemas kini.',
                  single: 'Bujang',
                  married: 'Berkahwin',
                  divorced: 'Bercerai',
              };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">
                {copy.title}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab;

                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveTab(tab)}
                            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                                isActive
                                    ? 'border-red-800 bg-red-800 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {copy.tabs[tab]}
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <p className="font-semibold">{copy.lockedTitle}</p>
                <p className="mt-1">{copy.lockedDescription}</p>
            </div>

            <form className="mt-5 space-y-4">
                {activeTab === 'personal' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.fullName}</span>
                            <input
                                type="text"
                                value={profile.fullName}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.icNo}</span>
                            <input
                                type="text"
                                value={profile.nationalId}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                        <label className="space-y-1 text-sm md:col-span-2">
                            <span className="font-medium text-gray-700">{copy.currentAddress}</span>
                            <input
                                type="text"
                                value={profile.currentAddress}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                    </div>
                )}

                {activeTab === 'study' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.matricNo}</span>
                            <input
                                type="text"
                                value={clientProfileMockSeed.studyInfo.matricNo}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.program}</span>
                            <input
                                type="text"
                                value={clientProfileMockSeed.studyInfo.program}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                        <label className="space-y-1 text-sm md:col-span-2">
                            <span className="font-medium text-gray-700">{copy.faculty}</span>
                            <input
                                type="text"
                                value={clientProfileMockSeed.studyInfo.faculty}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                    </div>
                )}

                {activeTab === 'marriage' && (
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.maritalStatus}</span>
                            <select
                                value={profile.maritalStatus}
                                disabled
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            >
                                <option value="single">{copy.single}</option>
                                <option value="married">{copy.married}</option>
                                <option value="divorced">{copy.divorced}</option>
                            </select>
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.dependents}</span>
                            <input
                                type="number"
                                min={0}
                                value={profile.dependentCount}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                            />
                        </label>
                    </div>
                )}

                {activeTab === 'health' && (
                    <div className="space-y-4">
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">
                                {copy.treatmentHistory}
                            </span>
                            <textarea
                                rows={4}
                                value={profile.treatmentHistory}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                                placeholder={copy.treatmentPlaceholder}
                            />
                        </label>
                        <label className="space-y-1 text-sm">
                            <span className="font-medium text-gray-700">{copy.medications}</span>
                            <textarea
                                rows={3}
                                value={profile.currentMedications}
                                readOnly
                                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-600 shadow-sm"
                                placeholder={copy.medicationsPlaceholder}
                            />
                        </label>
                    </div>
                )}

                {activeTab === 'confirmation' && (
                    <div className="space-y-4">
                        <label className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                            <input
                                type="checkbox"
                                checked
                                disabled
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-800"
                            />
                            <span>{copy.declaration}</span>
                        </label>
                    </div>
                )}
            </form>
        </section>
    );
}
