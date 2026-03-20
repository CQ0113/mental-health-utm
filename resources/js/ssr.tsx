import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { renderToString } from 'react-dom/server';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const pages = import.meta.glob('./pages/**/*.{tsx,ts,jsx,js}');

const resolveInertiaPage = (name: string) => {
    const normalized = name
        .replace(/\\/g, '/')
        .replace(/^\/+/, '')
        .replace(/\.(tsx|ts|jsx|js)$/i, '');

    const candidates = [
        `./pages/${normalized}.tsx`,
        `./pages/${normalized}.ts`,
        `./pages/${normalized}.jsx`,
        `./pages/${normalized}.js`,
    ];

    const directMatch = candidates.find((candidate) => candidate in pages);

    if (directMatch) {
        return resolvePageComponent(directMatch, pages);
    }

    const lowerCandidates = candidates.map((candidate) => candidate.toLowerCase());
    const fallbackMatch = Object.keys(pages).find((path) =>
        lowerCandidates.includes(path.toLowerCase()),
    );

    if (fallbackMatch) {
        return resolvePageComponent(fallbackMatch, pages);
    }

    throw new Error(
        `Page not found: ./pages/${normalized}.tsx (resolved from Inertia name: ${name})`,
    );
};

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: resolveInertiaPage,
        setup: ({ App, props }) => <App {...props} />,
    }),
);
