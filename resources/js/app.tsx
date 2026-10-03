import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';

const appName = 'Guchao';

createInertiaApp({
    title: (title) => title ? `${title} — ${appName}` : `${appName} — Trello Task Management`,
    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');
        const importPage = pages[`./Pages/${name}.tsx`];
        if (!importPage) {
            throw new Error(`Page "./Pages/${name}.tsx" not found.`);
        }
        const page = await importPage();
        return (page as any).default;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#6366f1',
    },
});
