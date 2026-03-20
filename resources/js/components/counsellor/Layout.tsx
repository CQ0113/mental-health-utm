import { Link, usePage } from '@inertiajs/react';
import type {ReactNode } from 'react';

type CounsellorLayoutProps = {
    title: string;
    subtitle: string;
    children: ReactNode;
};

const navItems = [
    { label: 'Dashboard', href: '/counsellor/dashboard' },
    { label: 'Appointments', href: '/counsellor/appointments' },
    { label: 'Slot Manager', href: '/counsellor/slots' },
    { label: 'Caseload', href: '/counsellor/caseload' },
    { label: 'Tasks', href: '/counsellor/tasks' },
    { label: 'Psychometric Results', href: '/counsellor/assessments' },
];

export default function CounsellorLayout({ title, subtitle, children }: CounsellorLayoutProps) {
    const { url } = usePage();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <aside className="fixed inset-y-0 left-0 z-30 w-72 border-r border-gray-200 bg-slate-800 text-white shadow-sm">
                <Link
                    href="/counsellor/dashboard"
                    className="block border-b border-slate-700 px-6 py-5 hover:bg-slate-700/40"
                >
                    <p className="text-xs tracking-wide text-slate-200">PsyCare 2.0</p>
                    <h1 className="text-lg font-semibold">Counsellor Portal</h1>
                </Link>
                <nav className="p-4">
                    <ul className="space-y-2">
                        {navItems.map((item) => (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`block rounded-lg px-3 py-2 text-sm font-medium transition ${
                                        url === item.href ? 'bg-slate-700 text-white' : 'hover:bg-slate-700'
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
                            className="rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50"
                        >
                            Admin Portal
                        </Link>
                        <Link
                            href="/counsellor/dashboard"
                            className="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-medium text-slate-700"
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
