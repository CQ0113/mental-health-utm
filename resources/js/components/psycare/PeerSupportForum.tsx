import { useEffect, useMemo, useState } from 'react';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import {
    FORUM_POST_STORAGE_KEY,
    FORUM_POST_UPDATED_EVENT,
    forumMockData,
    getForumPosts,
    saveForumPosts,
    type ForumPost,
} from '@/lib/psycare-data';
import { usePsycareLanguage } from '@/lib/psycare-language';

export default function PeerSupportForum() {
    const language = usePsycareLanguage();
    const { confirm, confirmDialog } = useConfirmDialog();
    const [posts, setPosts] = useState<ForumPost[]>(() => getForumPosts());
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicCategory, setNewTopicCategory] = useState('Akademik');
    const [newTopicContent, setNewTopicContent] = useState('');
    const [isModerating, setIsModerating] = useState(false);
    const [forumMessage, setForumMessage] = useState('');

    useEffect(() => {
        const reloadPosts = () => {
            setPosts(getForumPosts());
        };

        const handleStorageUpdate = (event: StorageEvent) => {
            if (event.key === FORUM_POST_STORAGE_KEY) {
                reloadPosts();
            }
        };

        window.addEventListener(FORUM_POST_UPDATED_EVENT, reloadPosts);
        window.addEventListener('storage', handleStorageUpdate);

        return () => {
            window.removeEventListener(FORUM_POST_UPDATED_EVENT, reloadPosts);
            window.removeEventListener('storage', handleStorageUpdate);
        };
    }, []);

    const visiblePosts = useMemo(() => {
        return posts.filter((post) => post.isPublished && !post.isHidden && !post.isDeleted);
    }, [posts]);

    const filteredThreads = useMemo(() => {
        return visiblePosts.filter((thread) => {
            const isMatchingCategory =
                activeCategory === 'Semua' || thread.category === activeCategory;
            const isMatchingQuery = thread.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            return isMatchingCategory && isMatchingQuery;
        });
    }, [activeCategory, searchQuery, visiblePosts]);

    const handleSupportClick = (threadId: number) => {
        const updatedPosts = posts.map((post) =>
            post.id === threadId
                ? {
                      ...post,
                      supportCount: post.supportCount + 1,
                  }
                : post,
        );

        setPosts(updatedPosts);
        saveForumPosts(updatedPosts);
    };

    const handleOpenComposer = () => {
        setForumMessage('');
        setIsComposerOpen(true);
    };

    const handleCancelComposer = () => {
        setIsComposerOpen(false);
        setNewTopicTitle('');
        setNewTopicCategory('Akademik');
        setNewTopicContent('');
    };

    const handleCreateTopic = async () => {
        if (!newTopicTitle.trim()) {
            setForumMessage(
                language === 'en'
                    ? 'Please enter a topic title before publishing.'
                    : 'Sila masukkan tajuk topik sebelum terbitkan.',
            );
            return;
        }

        const approved = await confirm({
            title: language === 'en' ? 'Publish Topic' : 'Terbitkan Topik',
            message:
                language === 'en'
                    ? 'Publish this topic to the forum?'
                    : 'Terbitkan topik ini ke forum?',
            confirmText: language === 'en' ? 'Publish' : 'Terbitkan',
        });

        if (!approved) {
            return;
        }

        setIsModerating(true);
        setForumMessage(
            language === 'en'
                ? 'Checking content safety with AI moderation...'
                : 'Sedang semak keselamatan kandungan dengan moderasi AI...',
        );

        try {
            const moderationResponse = await fetch('/psycare/forum/moderate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTopicTitle,
                    content: newTopicContent,
                }),
            });

            if (!moderationResponse.ok) {
                throw new Error('moderation_failed');
            }

            const moderationResult = (await moderationResponse.json()) as {
                safe: boolean;
                safetyScore?: number;
                reason?: string;
            };

            const safetyScore = moderationResult.safetyScore ?? (moderationResult.safe ? 90 : 20);

            const newPost: ForumPost = {
                id: Date.now(),
                title: newTopicTitle.trim(),
                content: newTopicContent.trim(),
                timestamp: language === 'en' ? 'Just now' : 'Baru sahaja',
                category: newTopicCategory,
                supportCount: 0,
                safetyScore,
                moderationReason: moderationResult.reason ?? 'approved',
                isPublished: moderationResult.safe,
                isHidden: !moderationResult.safe,
                isDeleted: false,
            };

            const updatedPosts = [newPost, ...posts];
            setPosts(updatedPosts);
            saveForumPosts(updatedPosts);

            if (!moderationResult.safe) {
                setForumMessage(
                    language === 'en'
                        ? `Topic blocked by AI moderation (score ${safetyScore}/100). It was sent to admin moderation queue.`
                        : `Topik disekat oleh moderasi AI (skor ${safetyScore}/100). Ia dihantar ke senarai semakan admin.`,
                );
                return;
            }
        } catch {
            setForumMessage(
                language === 'en'
                    ? 'Unable to verify AI moderation right now. Please try again.'
                    : 'Semakan moderasi AI tidak berjaya buat masa ini. Sila cuba lagi.',
            );
            return;
        } finally {
            setIsModerating(false);
        }

        setActiveCategory('Semua');
        setIsComposerOpen(false);
        setNewTopicTitle('');
        setNewTopicCategory('Akademik');
        setNewTopicContent('');
        setForumMessage(
            language === 'en'
                ? 'New topic published successfully.'
                : 'Topik baharu berjaya diterbitkan.',
        );
    };

    return (
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder={
                        language === 'en'
                            ? 'Search forum topics...'
                            : 'Cari topik forum...'
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100 md:max-w-md"
                />
                <button
                    type="button"
                    onClick={handleOpenComposer}
                    disabled={isModerating}
                    className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {language === 'en' ? 'Open New Topic' : 'Buka Topik Baru'}
                </button>
            </div>

            {isComposerOpen && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                        {language === 'en' ? 'Create New Topic' : 'Cipta Topik Baharu'}
                    </h3>

                    <div className="mt-3 grid gap-3">
                        <input
                            type="text"
                            value={newTopicTitle}
                            onChange={(event) => setNewTopicTitle(event.target.value)}
                            placeholder={language === 'en' ? 'Topic title' : 'Tajuk topik'}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />

                        <select
                            value={newTopicCategory}
                            onChange={(event) => setNewTopicCategory(event.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        >
                            {forumMockData.categories
                                .filter((category) => category !== 'Semua')
                                .map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                        </select>

                        <textarea
                            rows={4}
                            value={newTopicContent}
                            onChange={(event) => setNewTopicContent(event.target.value)}
                            placeholder={
                                language === 'en'
                                    ? 'Describe your topic (optional)...'
                                    : 'Terangkan topik anda (pilihan)...'
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none transition focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />

                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={handleCreateTopic}
                                disabled={isModerating}
                                className="rounded-lg bg-red-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isModerating
                                    ? language === 'en'
                                        ? 'Moderating...'
                                        : 'Moderasi...'
                                    : language === 'en'
                                      ? 'Publish Topic'
                                      : 'Terbitkan Topik'}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelComposer}
                                disabled={isModerating}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {language === 'en' ? 'Cancel' : 'Batal'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {forumMessage && (
                <p className="mt-3 text-sm text-green-700">{forumMessage}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {forumMockData.categories.map((category) => {
                    const isActive = activeCategory === category;

                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => setActiveCategory(category)}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                isActive
                                    ? 'border-yellow-500 bg-yellow-100 text-yellow-900'
                                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            [{category}]
                        </button>
                    );
                })}
            </div>

            <div className="mt-5 space-y-3">
                {filteredThreads.map((thread) => (
                    <article
                        key={thread.id}
                        className="flex items-start justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-800">
                                A
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">
                                    {thread.title}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {language === 'en' ? 'Anonymous' : 'Anonymous'} • {thread.timestamp}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleSupportClick(thread.id)}
                            className="rounded-lg border border-yellow-500 bg-yellow-50 px-3 py-2 text-xs font-semibold text-yellow-800 transition hover:bg-yellow-100"
                        >
                            {language === 'en' ? 'Support' : 'Sokong'} ({thread.supportCount})
                        </button>
                    </article>
                ))}

                {filteredThreads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-500">
                        {language === 'en'
                            ? 'No topics found for this search/category.'
                            : 'Tiada topik dijumpai untuk carian/kategori ini.'}
                    </div>
                )}
            </div>
            {confirmDialog}
        </section>
    );
}
