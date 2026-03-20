import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '@/components/admin/Layout';
import { useConfirmDialog } from '@/components/shared/useConfirmDialog';
import {
    getDefaultForumPosts,
    getForumPosts,
    saveForumPosts,
    type ForumPost,
} from '@/lib/psycare-data';

type ModerationLogEntry = {
    id: number;
    action: 'hide' | 'unhide' | 'delete' | 'approve';
    postId: number;
    title: string;
    safetyScore: number;
    timestamp: string;
};

const MODERATION_LOG_STORAGE_KEY = 'psycare.admin.forum.moderation-log';

const getScoreBadgeClass = (score: number) => {
    if (score < 30) {
        return 'bg-red-100 text-red-800';
    }

    if (score < 60) {
        return 'bg-amber-100 text-amber-800';
    }

    return 'bg-emerald-100 text-emerald-800';
};

export default function AdminForumPage() {
    const { confirm, confirmDialog } = useConfirmDialog();
    const [posts, setPosts] = useState<ForumPost[]>(() => getForumPosts());
    const [moderationLog, setModerationLog] = useState<ModerationLogEntry[]>([]);
    const [flashMessage, setFlashMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
    const [safetyFilter, setSafetyFilter] = useState<'all' | 'unsafe' | 'caution' | 'safe'>('all');

    useEffect(() => {
        const storedLog = localStorage.getItem(MODERATION_LOG_STORAGE_KEY);

        if (!storedLog) {
            setModerationLog([]);
            return;
        }

        try {
            const parsedLog = JSON.parse(storedLog) as ModerationLogEntry[];
            setModerationLog(Array.isArray(parsedLog) ? parsedLog : []);
        } catch {
            setModerationLog([]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(MODERATION_LOG_STORAGE_KEY, JSON.stringify(moderationLog));
    }, [moderationLog]);

    const pushModerationLog = (
        action: ModerationLogEntry['action'],
        post: ForumPost,
    ) => {
        const nextEntry: ModerationLogEntry = {
            id: Date.now(),
            action,
            postId: post.id,
            title: post.title,
            safetyScore: post.safetyScore,
            timestamp: new Date().toISOString(),
        };

        setModerationLog((current) => [nextEntry, ...current].slice(0, 50));
    };

    const unsafePosts = useMemo(
        () => posts.filter((post) => !post.isDeleted && post.safetyScore < 30 && !post.isPublished),
        [posts],
    );

    const visiblePosts = useMemo(
        () => posts.filter((post) => !post.isDeleted),
        [posts],
    );

    const categoryOptions = useMemo(
        () => ['All', ...new Set(visiblePosts.map((post) => post.category))],
        [visiblePosts],
    );

    const filteredVisiblePosts = useMemo(() => {
        return visiblePosts.filter((post) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                categoryFilter === 'All' || post.category === categoryFilter;

            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'published' ? post.isPublished && !post.isHidden : post.isHidden || !post.isPublished);

            const matchesSafety =
                safetyFilter === 'all' ||
                (safetyFilter === 'unsafe'
                    ? post.safetyScore < 30
                    : safetyFilter === 'caution'
                      ? post.safetyScore >= 30 && post.safetyScore < 60
                      : post.safetyScore >= 60);

            return matchesSearch && matchesCategory && matchesStatus && matchesSafety;
        });
    }, [visiblePosts, searchQuery, categoryFilter, statusFilter, safetyFilter]);

    const filteredUnsafePosts = useMemo(() => {
        return unsafePosts.filter((post) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                categoryFilter === 'All' || post.category === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [unsafePosts, searchQuery, categoryFilter]);

    const handleHidePost = async (postId: number) => {
        const approved = await confirm({
            title: 'Hide Post',
            message: `Hide post ${postId}? It will no longer be publicly visible.`,
            confirmText: 'Hide',
            tone: 'danger',
        });

        if (!approved) {
            return;
        }

        const targetPost = posts.find((post) => post.id === postId);
        const updatedPosts = posts.map((post) =>
            post.id === postId
                ? {
                      ...post,
                      isHidden: true,
                      isPublished: false,
                  }
                : post,
        );

        setPosts(updatedPosts);
        saveForumPosts(updatedPosts);
        if (targetPost) {
            pushModerationLog('hide', targetPost);
        }
        setFlashMessage(`Post ${postId} has been hidden.`);
    };

    const handleUnhidePost = async (postId: number) => {
        const approved = await confirm({
            title: 'Unhide Post',
            message: `Unhide post ${postId}? This may restore visibility based on safety rules.`,
            confirmText: 'Unhide',
        });

        if (!approved) {
            return;
        }

        const targetPost = posts.find((post) => post.id === postId);
        const updatedPosts = posts.map((post) =>
            post.id === postId
                ? {
                      ...post,
                      isHidden: false,
                      isPublished: post.safetyScore >= 30,
                  }
                : post,
        );

        setPosts(updatedPosts);
        saveForumPosts(updatedPosts);
        if (targetPost) {
            pushModerationLog('unhide', targetPost);
        }
        setFlashMessage(`Post ${postId} visibility has been restored.`);
    };

    const handleDeletePost = async (postId: number) => {
        const approved = await confirm({
            title: 'Delete Post',
            message: `Delete post ${postId}? This action is not reversible.`,
            confirmText: 'Delete',
            tone: 'danger',
        });

        if (!approved) {
            return;
        }

        const targetPost = posts.find((post) => post.id === postId);
        const updatedPosts = posts.map((post) =>
            post.id === postId
                ? {
                      ...post,
                      isDeleted: true,
                      isPublished: false,
                  }
                : post,
        );

        setPosts(updatedPosts);
        saveForumPosts(updatedPosts);
        if (targetPost) {
            pushModerationLog('delete', targetPost);
        }
        setFlashMessage(`Post ${postId} has been deleted.`);
    };

    const handleApprovePost = async (postId: number) => {
        const approved = await confirm({
            title: 'Approve and Publish',
            message: `Approve and publish post ${postId}? It will become visible to clients.`,
            confirmText: 'Approve',
        });

        if (!approved) {
            return;
        }

        const targetPost = posts.find((post) => post.id === postId);

        const updatedPosts = posts.map((post) =>
            post.id === postId
                ? {
                      ...post,
                      isPublished: true,
                      isHidden: false,
                      moderationReason: `manually-approved-by-admin: ${post.moderationReason}`,
                  }
                : post,
        );

        setPosts(updatedPosts);
        saveForumPosts(updatedPosts);
        if (targetPost) {
            pushModerationLog('approve', targetPost);
        }
        setFlashMessage(`Post ${postId} has been approved and published.`);
    };

    const handleLoadDemoPosts = async () => {
        const approved = await confirm({
            title: 'Load Demo Posts',
            message:
                'Load demo forum posts? This will replace current forum post data in this demo view.',
            confirmText: 'Load',
        });

        if (!approved) {
            return;
        }

        const demoPosts = getDefaultForumPosts();
        setPosts(demoPosts);
        saveForumPosts(demoPosts);
        setFlashMessage('Demo forum posts loaded successfully.');
    };

    return (
        <>
            <Head title="Admin Forum Moderation" />
            <AdminLayout
                title="Forum Moderation"
                subtitle="Review AI safety scores, unsafe queue, and manage post visibility"
            >
                {flashMessage && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                        {flashMessage}
                    </div>
                )}

                <section className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Total Posts</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">{visiblePosts.length}</p>
                    </article>
                    <article className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-red-700">Unsafe Queue (&lt; 30)</p>
                        <p className="mt-2 text-2xl font-semibold text-red-800">{unsafePosts.length}</p>
                    </article>
                    <article className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase text-gray-500">Hidden Posts</p>
                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {visiblePosts.filter((post) => post.isHidden).length}
                        </p>
                    </article>
                </section>

                <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">Forum Management Filters</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search title/content"
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        />

                        <select
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        >
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(event.target.value as 'all' | 'published' | 'hidden')
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        >
                            <option value="all">All Statuses</option>
                            <option value="published">Published</option>
                            <option value="hidden">Hidden / Blocked</option>
                        </select>

                        <select
                            value={safetyFilter}
                            onChange={(event) =>
                                setSafetyFilter(
                                    event.target.value as 'all' | 'unsafe' | 'caution' | 'safe',
                                )
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                        >
                            <option value="all">All Safety Bands</option>
                            <option value="unsafe">Unsafe (&lt;30)</option>
                            <option value="caution">Caution (30-59)</option>
                            <option value="safe">Safe (60+)</option>
                        </select>
                    </div>
                </section>

                <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">Unsafe Posts (AI Score Below 30)</h2>
                    <div className="mt-4 space-y-3">
                        {filteredUnsafePosts.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                                No unsafe posts at the moment.
                            </p>
                        ) : (
                            filteredUnsafePosts.map((post) => (
                                <article key={post.id} className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                        <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                                        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                                            Score {post.safetyScore}/100
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-gray-700">{post.content || 'No content provided.'}</p>
                                    <p className="mt-2 text-xs text-gray-600">Reason: {post.moderationReason}</p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleApprovePost(post.id)}
                                            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                        >
                                            Approve &amp; Publish
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleHidePost(post.id)}
                                            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                                        >
                                            Hide
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePost(post.id)}
                                            className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">All Forum Posts</h2>
                    <div className="mt-4 space-y-3">
                        {filteredVisiblePosts.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
                                <p>No forum posts available.</p>
                                <button
                                    type="button"
                                    onClick={handleLoadDemoPosts}
                                    className="mt-3 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                >
                                    Load Demo Posts
                                </button>
                            </div>
                        ) : (
                            filteredVisiblePosts.map((post) => (
                                <article key={post.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                                            <p className="mt-1 text-xs text-gray-600">
                                                {post.category} • {post.timestamp} • Support {post.supportCount}
                                            </p>
                                        </div>
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getScoreBadgeClass(post.safetyScore)}`}>
                                            Score {post.safetyScore}/100
                                        </span>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600">
                                        Status:{' '}
                                        {post.isDeleted
                                            ? 'Deleted'
                                            : post.isHidden || !post.isPublished
                                              ? 'Hidden / Blocked'
                                              : 'Published'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {post.isHidden ? (
                                            <button
                                                type="button"
                                                onClick={() => handleUnhidePost(post.id)}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Unhide
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleHidePost(post.id)}
                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                            >
                                                Hide
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => handleDeletePost(post.id)}
                                            className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900"
                                        >
                                            Delete
                                        </button>
                                        {!post.isPublished && (
                                            <button
                                                type="button"
                                                onClick={() => handleApprovePost(post.id)}
                                                className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                            >
                                                Approve &amp; Publish
                                            </button>
                                        )}
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </section>

                <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                    <h2 className="text-base font-semibold text-gray-900">Moderation Event Log</h2>
                    <div className="mt-4 space-y-2">
                        {moderationLog.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600">
                                No moderation actions recorded yet.
                            </p>
                        ) : (
                            moderationLog.map((entry) => (
                                <article
                                    key={entry.id}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm"
                                >
                                    <p className="font-semibold text-gray-900">
                                        {entry.action.toUpperCase()} • Post #{entry.postId} • Score {entry.safetyScore}/100
                                    </p>
                                    <p className="mt-1 text-gray-700">{entry.title}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {new Date(entry.timestamp).toLocaleString('en-GB')}
                                    </p>
                                </article>
                            ))
                        )}
                    </div>
                </section>
            </AdminLayout>
            {confirmDialog}
        </>
    );
}
