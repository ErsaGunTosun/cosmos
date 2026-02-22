'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';

export default function AdminSettingsClient() {
    const router = useRouter();
    const [authed, setAuthed] = useState(false);
    const [config, setConfig] = useState({
        theme: 'light',
        custom_colors: { background: '#252422', foreground: '#fffcf2', border: '#403d39', muted: '#ccc5b9' },
        homepage_sort: 'custom'
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/auth')
            .then(res => {
                if (!res.ok) router.push('/login');
                else setAuthed(true);
            });
    }, [router]);

    useEffect(() => {
        if (!authed) return;
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setConfig(data));
    }, [authed]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });

            if (!res.ok) throw new Error('Failed to save settings');

            setMessage('Settings saved successfully! Refreshing to apply changes...');
            setTimeout(() => {
                window.location.href = '/admin'; // Force hard refresh to apply new layout config/theme
            }, 1000);
        } catch (err) {
            setMessage('Error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!authed) return null;

    return (
        <main className="min-h-screen py-12">
            <Container className="max-w-xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                        Site Settings
                    </h1>
                    <button
                        onClick={() => router.push('/admin')}
                        className="text-sm px-3 py-1.5 font-medium text-[var(--muted)] hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] rounded-md transition-colors cursor-pointer"
                    >
                        &larr; Back to Admin
                    </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6 bg-[var(--background)] p-6 rounded-lg border border-[var(--border)]">

                    {/* THEME SELECTION */}
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-3">Color Theme</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {['light', 'dark', 'custom'].map((themeOption) => (
                                <label
                                    key={themeOption}
                                    className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none 
                                    ${config.theme === themeOption ? 'border-[var(--foreground)] ring-1 ring-[var(--foreground)]' : 'border-[var(--border)]'}
                                `}
                                >
                                    <input
                                        type="radio"
                                        name="theme"
                                        value={themeOption}
                                        className="sr-only"
                                        checked={config.theme === themeOption}
                                        onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                                    />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-medium text-[var(--foreground)] capitalize">
                                                {themeOption}
                                            </span>
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* CUSTOM THEME COLORS */}
                    {config.theme === 'custom' && (
                        <div className="p-4 rounded-lg bg-[var(--foreground)]/5 border border-[var(--border)]">
                            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Custom Colors</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-[var(--muted)] mb-1">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.custom_colors?.background || '#252422'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, background: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.custom_colors?.background || '#252422'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, background: e.target.value }
                                            })}
                                            className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-transparent text-[var(--foreground)] outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-[var(--muted)] mb-1">Text Color (Foreground)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.custom_colors?.foreground || '#fffcf2'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, foreground: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.custom_colors?.foreground || '#fffcf2'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, foreground: e.target.value }
                                            })}
                                            className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-transparent text-[var(--foreground)] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-[var(--muted)] mb-1">Border Color (Lines/Dividers)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.custom_colors?.border || '#403d39'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, border: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.custom_colors?.border || '#403d39'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, border: e.target.value }
                                            })}
                                            className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-transparent text-[var(--foreground)] outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-[var(--muted)] mb-1">Muted Color (Secondary text)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.custom_colors?.muted || '#ccc5b9'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, muted: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded shrink-0 cursor-pointer border-0 p-0"
                                        />
                                        <input
                                            type="text"
                                            value={config.custom_colors?.muted || '#ccc5b9'}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                custom_colors: { ...config.custom_colors, muted: e.target.value }
                                            })}
                                            className="w-full px-2 py-1.5 text-sm border border-[var(--border)] rounded bg-transparent text-[var(--foreground)] outline-none"
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>
                    )}

                    <hr className="border-[var(--border)]" />

                    {/* SORTING SELECTION */}
                    <div>
                        <h2 className="text-sm font-semibold text-[var(--foreground)] mb-1">Homepage Sort Order</h2>
                        <p className="text-xs text-[var(--muted)] mb-3">Choose how photos are displayed on the main page.</p>

                        <div className="space-y-3">
                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="homepage_sort"
                                    value="custom"
                                    className="accent-[var(--foreground)]"
                                    checked={config.homepage_sort === 'custom'}
                                    onChange={(e) => setConfig({ ...config, homepage_sort: e.target.value })}
                                />
                                <div>
                                    <div className="text-sm font-medium text-[var(--foreground)]">Custom Order</div>
                                    <div className="text-xs text-[var(--muted)]">Photos are sorted by your manual drag-and-drop arrangement.</div>
                                </div>
                            </label>

                            <label className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="homepage_sort"
                                    value="date"
                                    className="accent-[var(--foreground)]"
                                    checked={config.homepage_sort === 'date'}
                                    onChange={(e) => setConfig({ ...config, homepage_sort: e.target.value })}
                                />
                                <div>
                                    <div className="text-sm font-medium text-[var(--foreground)]">Date Added (Newest First)</div>
                                    <div className="text-xs text-[var(--muted)]">Photos are automatically sorted by the time they were uploaded.</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    {message && (
                        <div className="text-sm text-center p-2 rounded-md bg-[var(--background)] text-[var(--muted)] border border-[var(--border)]">
                            {message}
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`w-full px-4 py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-md hover:opacity-90 transition-opacity ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                            {saving ? 'Saving...' : 'Save Settings'}
                        </button>
                    </div>

                </form>
            </Container>
        </main>
    );
}
