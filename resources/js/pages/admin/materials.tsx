import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import {
    generatePsychometricTestFromPdfUpload,
    getPsychometricTests,
    savePsychometricTests,
    type PsychometricTest,
} from '@/lib/psycare-data';

export default function AdminMaterialsPage() {
    const [psychometricTests, setPsychometricTests] = useState<PsychometricTest[]>(() =>
        getPsychometricTests(),
    );
    const [testTitle, setTestTitle] = useState('');
    const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);

    const [flashMessage, setFlashMessage] = useState('');

    const handleUploadTestingMaterial = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedTitle = testTitle.trim();

        if (!normalizedTitle || !uploadedPdf) {
            setFlashMessage('Please enter test title and upload a PDF file before generating.');
            return;
        }

        if (uploadedPdf.type !== 'application/pdf') {
            setFlashMessage('Only PDF documents are supported for automatic test generation.');
            return;
        }

        const createdTest = generatePsychometricTestFromPdfUpload(normalizedTitle, uploadedPdf);

        const updatedTests = [...psychometricTests, createdTest];
        setPsychometricTests(updatedTests);
        savePsychometricTests(updatedTests);
        setFlashMessage(
            `PDF uploaded successfully. Test ${createdTest.code} generated with ${createdTest.questions.length} questions.`,
        );
        setTestTitle('');
        setUploadedPdf(null);
    };

    return (
        <>
            <Head title="Admin Materials" />
            <AdminLayout
                title="Testing Materials"
                subtitle="Upload psychometric testing materials for client assessments"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <form
                        onSubmit={handleUploadTestingMaterial}
                        className="grid gap-3"
                    >
                        <h2 className="text-base font-semibold text-gray-900">Upload Testing Material (PDF Auto-Generate)</h2>
                        <div className="mt-2 grid gap-3">
                            <input
                                value={testTitle}
                                onChange={(event) => setTestTitle(event.target.value)}
                                placeholder="Test Title"
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                            <input
                                type="file"
                                accept="application/pdf,.pdf"
                                onChange={(event) => setUploadedPdf(event.target.files?.[0] ?? null)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            />
                            {uploadedPdf && (
                                <p className="text-xs text-gray-600">
                                    Selected PDF: {uploadedPdf.name}
                                </p>
                            )}
                            <button
                                type="submit"
                                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
                            >
                                Upload PDF &amp; Generate Test
                            </button>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">
                            Admin only needs test title and PDF document. Questions are auto-generated in this mock flow.
                        </p>
                        <p className="text-xs text-gray-500">Current tests available to clients: {psychometricTests.length}</p>
                    </form>
                </section>
            </AdminLayout>
        </>
    );
}
