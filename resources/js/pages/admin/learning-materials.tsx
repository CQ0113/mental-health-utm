import { Head } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import {
    getResourceLibraryItems,
    saveResourceLibraryItems,
    type ResourceItem,
} from '@/lib/psycare-data';

export default function AdminLearningMaterialsPage() {
    const [resources, setResources] = useState<ResourceItem[]>(() =>
        getResourceLibraryItems(),
    );
    const [resourceTitle, setResourceTitle] = useState('Time Blocking Study Planner');
    const [resourceDescription, setResourceDescription] = useState(
        'Practical planner to reduce academic stress by scheduling focused sessions.',
    );
    const [resourceCategory, setResourceCategory] = useState<ResourceItem['category']>('stress');
    const [resourceType, setResourceType] = useState<ResourceItem['type']>('Toolkit');
    const [resourceDuration, setResourceDuration] = useState('10 min');
    const [resourceUrl, setResourceUrl] = useState('https://example.org/resources/time-blocking-planner');
    const [flashMessage, setFlashMessage] = useState('');

    const handleUploadLearningMaterial = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!resourceTitle.trim() || !resourceUrl.trim()) {
            setFlashMessage('Please fill in learning material title and URL before uploading.');
            return;
        }

        const createdResource: ResourceItem = {
            id: Date.now(),
            titleEn: resourceTitle.trim(),
            titleMs: resourceTitle.trim(),
            descriptionEn: resourceDescription.trim() || 'Uploaded by admin.',
            descriptionMs: resourceDescription.trim() || 'Dimuat naik oleh admin.',
            category: resourceCategory,
            type: resourceType,
            duration: resourceDuration.trim() || '5 min',
            url: resourceUrl.trim(),
        };

        const updatedResources = [...resources, createdResource];
        setResources(updatedResources);
        saveResourceLibraryItems(updatedResources);
        setFlashMessage(`Learning material "${createdResource.titleEn}" uploaded to Resource Library.`);
    };

    return (
        <>
            <Head title="Admin Learning Materials" />
            <AdminLayout
                title="Learning Materials"
                subtitle="Upload materials for client Resource Library"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <form
                        onSubmit={handleUploadLearningMaterial}
                        className="grid gap-3"
                    >
                        <h2 className="text-base font-semibold text-gray-900">Upload Learning Material</h2>
                        <input
                            value={resourceTitle}
                            onChange={(event) => setResourceTitle(event.target.value)}
                            placeholder="Resource Title"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />
                        <textarea
                            rows={3}
                            value={resourceDescription}
                            onChange={(event) => setResourceDescription(event.target.value)}
                            placeholder="Description"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />
                        <div className="grid gap-3 md:grid-cols-2">
                            <select
                                value={resourceCategory}
                                onChange={(event) =>
                                    setResourceCategory(event.target.value as ResourceItem['category'])
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="stress">Stress</option>
                                <option value="anxiety">Anxiety</option>
                                <option value="sleep">Sleep</option>
                                <option value="support">Support</option>
                            </select>
                            <select
                                value={resourceType}
                                onChange={(event) =>
                                    setResourceType(event.target.value as ResourceItem['type'])
                                }
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            >
                                <option value="Artikel">Artikel</option>
                                <option value="Video">Video</option>
                                <option value="Toolkit">Toolkit</option>
                            </select>
                        </div>
                        <input
                            value={resourceDuration}
                            onChange={(event) => setResourceDuration(event.target.value)}
                            placeholder="Duration (e.g. 10 min)"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />
                        <input
                            value={resourceUrl}
                            onChange={(event) => setResourceUrl(event.target.value)}
                            placeholder="URL"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />
                        <button
                            type="submit"
                            className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white hover:bg-red-900"
                        >
                            Upload Learning Material
                        </button>
                        <p className="mt-1 text-xs text-gray-500">Current resources available to clients: {resources.length}</p>
                    </form>
                </section>
            </AdminLayout>
        </>
    );
}
