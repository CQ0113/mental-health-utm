import { Head, router, useForm } from '@inertiajs/react';
import { type FormEvent, useState } from 'react';

type QuickLoginAccount = {
    role: 'admin' | 'client' | 'counselor';
    email: string;
    label: string;
};

type LoginPageProps = {
    quickLoginAccounts: QuickLoginAccount[];
};

export default function LoginPage({ quickLoginAccounts }: LoginPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const [quickLoginProcessing, setQuickLoginProcessing] = useState(false);

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/login');
    }

    function submitQuickLogin(role: QuickLoginAccount['role']) {
        // Post the role directly instead of going through useForm's
        // setData + post — setData queues an async state update, so a
        // post() called right after it would still see the *previous*
        // render's data and submit the wrong (stale) role.
        setQuickLoginProcessing(true);
        router.post(
            '/login/quick',
            { role },
            { onFinish: () => setQuickLoginProcessing(false) },
        );
    }

    return (
        <>
            <Head title="Log In" />
            <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center">
                        <h1 className="text-2xl font-semibold text-gray-900">PsyCare 2.0</h1>
                        <p className="mt-1 text-sm text-gray-500">Sign in to continue to your portal.</p>
                    </div>

                    {quickLoginAccounts.length > 0 && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <p className="mb-3 text-xs font-medium tracking-wide text-red-800 uppercase">
                                Dev quick login (local only)
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                                {quickLoginAccounts.map((account) => (
                                    <button
                                        key={account.role}
                                        type="button"
                                        disabled={quickLoginProcessing}
                                        onClick={() => submitQuickLogin(account.role)}
                                        className="rounded-md border border-red-300 bg-white px-2 py-2 text-sm font-medium text-red-800 shadow-sm transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {account.label}
                                    </button>
                                ))}
                            </div>
                            <p className="mt-2 text-[11px] text-red-700">
                                One click, no password — logs you straight into a seeded demo account for that role.
                            </p>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="username"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 focus:outline-none"
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
                        </div>

                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:ring-red-500 focus:outline-none"
                            />
                            {errors.password && <p className="mt-1 text-xs text-red-700">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            Remember me
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-md bg-red-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Log In
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
