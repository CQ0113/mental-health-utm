import { Link, usePage } from '@inertiajs/react';
import type {ReactNode } from 'react';

type AdminLayoutProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
};

const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Counsellor(PPsi)', href: '/admin/counsellor-ppsi' },
    { label: 'Counsellor Timetable', href: '/admin/counsellor-timetable' },
    { label: 'Client Information', href: '/admin/client-information' },
    { label: 'Appointment Queue', href: '/admin/appointments' },
    { label: 'Testing Materials', href: '/admin/materials' },
    { label: 'Learning Materials', href: '/admin/learning-materials' },
    { label: 'Forum Moderation', href: '/admin/forum' },
];

export default function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <aside className="fixed inset-y-0 left-0 z-50 w-72 border-r border-gray-200 bg-red-800 text-white shadow-sm">
                <Link
                    href="/admin/dashboard"
                    className="block border-b border-red-700 px-6 py-5 hover:bg-red-700/40"
                >
                    <p className="text-xs tracking-wide text-red-100">PsyCare 2.0</p>
                    <h1 className="text-lg font-semibold">Admin Portal</h1>
                </Link>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`relative z-10 block rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        url === item.href ? 'bg-red-700 text-white' : 'hover:bg-red-700'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            <div className="pl-72">
                <header className="sticky top-0 z-20 border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <Link
                            href="/psycare/dashboard"
                            className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Client Portal
                        </Link>
                        <Link
                            href="/admin/dashboard"
                            className="rounded border border-red-300 bg-red-50 px-2 py-1 font-medium text-red-700"
                        >
                            Admin Portal
                        </Link>
                        <Link
                            href="/counsellor/dashboard"
                            className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Counsellor Portal
                        </Link>
                    </div>
                </header>
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}
