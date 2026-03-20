import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/psycare';
import {
    getResourceLibraryItems,
    RESOURCE_LIBRARY_STORAGE_KEY,
    RESOURCE_LIBRARY_UPDATED_EVENT,
    type ResourceItem,
} from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';

export default function PsyCareResourceLibraryPage() {
    const language = usePsycareLanguage();
    const [resourceItems, setResourceItems] = useState<ResourceItem[]>(() =>
        getResourceLibraryItems(),
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState<'all' | ResourceItem['category']>('all');

    useEffect(() => {
        const reloadResources = () => {
            setResourceItems(getResourceLibraryItems());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === RESOURCE_LIBRARY_STORAGE_KEY) {
                reloadResources();
            }
        };

        window.addEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadResources);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(RESOURCE_LIBRARY_UPDATED_EVENT, reloadResources);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const copy =
        language === 'en'
            ? {
                  title: 'Resource Library',
                  subtitle: 'Mental Health Learning Hub',
                  description:
                      'Explore trusted mental health resources to support your wellbeing journey.',
                  searchPlaceholder: 'Search resources...',
                  all: 'All',
                  stress: 'Stress',
                  anxiety: 'Anxiety',
                  sleep: 'Sleep',
                  support: 'Support',
                  openResource: 'Open Resource',
                  noResult: 'No resources found for this filter/search.',
              }
            : {
                  title: 'Perpustakaan Sumber',
                  subtitle: 'Hab Pembelajaran Kesihatan Mental',
                  description:
                      'Terokai sumber kesihatan mental yang dipercayai untuk menyokong kesejahteraan anda.',
                  searchPlaceholder: 'Cari sumber...',
                  all: 'Semua',
                  stress: 'Tekanan',
                  anxiety: 'Kebimbangan',
                  sleep: 'Tidur',
                  support: 'Sokongan',
                  openResource: 'Buka Sumber',
                  noResult: 'Tiada sumber dijumpai untuk carian/penapis ini.',
              };

    const filteredResources = useMemo(() => {
        return resourceItems.filter((resource) => {
            const title = language === 'en' ? resource.titleEn : resource.titleMs;
            const description =
                language === 'en' ? resource.descriptionEn : resource.descriptionMs;

            const matchesCategory =
                activeCategory === 'all' || resource.category === activeCategory;
            const matchesSearch = `${title} ${description}`
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return matchesCategory && matchesSearch;
        });
    }, [activeCategory, language, resourceItems, searchQuery]);

    const categoryOptions: Array<{ key: 'all' | ResourceItem['category']; label: string }> = [
        { key: 'all', label: copy.all },
        { key: 'stress', label: copy.stress },
        { key: 'anxiety', label: copy.anxiety },
        { key: 'sleep', label: copy.sleep },
        { key: 'support', label: copy.support },
    ];

    return (
        <>
            <Head title={copy.title} />
            <Layout>
                <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-800">
                        {copy.title}
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-gray-900">{copy.subtitle}</h2>
                    <p className="mt-1 text-sm text-gray-600">{copy.description}</p>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder={copy.searchPlaceholder}
                            className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />
                        <div className="flex flex-wrap gap-2">
                            {categoryOptions.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setActiveCategory(option.key)}
                                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                        activeCategory === option.key
                                            ? 'border-red-800 bg-red-800 text-white'
                                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                        {filteredResources.map((resource) => {
                            const title = language === 'en' ? resource.titleEn : resource.titleMs;
                            const description =
                                language === 'en' ? resource.descriptionEn : resource.descriptionMs;

                            return (
                                <article
                                    key={resource.id}
                                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-900">
                                            {resource.type}
                                        </span>
                                        <span className="text-xs text-gray-500">{resource.duration}</span>
                                    </div>
                                    <h3 className="mt-3 text-sm font-semibold text-gray-900">{title}</h3>
                                    <p className="mt-1 text-sm text-gray-600">{description}</p>
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-3 inline-flex rounded-lg bg-red-800 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-900"
                                    >
                                        {copy.openResource}
                                    </a>
                                </article>
                            );
                        })}
                    </div>

                    {filteredResources.length === 0 && (
                        <div className="mt-5 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                            {copy.noResult}
                        </div>
                    )}
                </section>
            </Layout>
        </>
    );
}
