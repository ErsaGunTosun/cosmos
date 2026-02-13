'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPhotoEdit({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [photo, setPhoto] = useState(null);
    const [cluster, setCluster] = useState('');
    const [location, setLocation] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        fetch(`/api/photos/${id}`)
            .then(res => res.json())
            .then(data => {
                setPhoto(data);
                setCluster(data.cluster || '');
                setLocation(data.location || '');
            });
    }, [id]);

    useEffect(() => {
        function handleKey(e) {
            if (!photo) return;
            if (e.key === 'ArrowLeft' && photo.prev) router.push(`/admin/photo/${photo.prev}`);
            if (e.key === 'ArrowRight' && photo.next) router.push(`/admin/photo/${photo.next}`);
            if (e.key === 'Escape') router.push('/admin');
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [photo, router]);

    async function handleSave() {
        setSaving(true);
        await fetch(`/api/photos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cluster, location }),
        });
        setSaving(false);
        router.push('/admin');
    }

    async function handleDelete() {
        if (!confirm('Delete this photo?')) return;
        setDeleting(true);
        await fetch(`/api/photos/${id}`, { method: 'DELETE' });
        router.push('/admin');
    }

    if (!photo) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col lg:flex-row">
            {/* Sol: Fotoğraf */}
            <div className="flex-1 flex flex-col bg-[#F5F5F5] min-h-0">
                <div className="shrink-0 p-5">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Admin
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center min-h-0 px-12 pb-4">
                    <div className="relative w-full max-w-2xl h-full">
                        <Image
                            src={photo.src}
                            alt="Photo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <div className="shrink-0 flex items-center justify-center gap-4 pb-5">
                    {photo.prev ? (
                        <Link
                            href={`/admin/photo/${photo.prev}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            ← Prev
                        </Link>
                    ) : <span className="text-sm text-transparent select-none">← Prev</span>}

                    {photo.next ? (
                        <Link
                            href={`/admin/photo/${photo.next}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Next →
                        </Link>
                    ) : <span className="text-sm text-transparent select-none">Next →</span>}
                </div>
            </div>

            {/* Sağ: Edit Sidebar */}
            <div className="w-full lg:w-80 shrink-0 border-l border-[var(--border)] bg-white p-6 flex flex-col gap-5">
                {/* Dosya adı */}
                <div className="text-xs text-[var(--muted)]">
                    {photo.src.split('/').pop()}
                </div>

                {/* Cluster */}
                <div>
                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Cluster</label>
                    <input
                        type="text"
                        value={cluster}
                        onChange={e => setCluster(e.target.value)}
                        placeholder="e.g. Portraits"
                        className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Location</label>
                    <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="e.g. Istanbul"
                        className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
                    />
                </div>

                <div className="h-px bg-[var(--border)]" />

                {/* Save */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2.5 text-sm font-medium text-white bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>

                {/* Delete */}
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-2.5 text-sm text-red-500 hover:text-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                    {deleting ? 'Deleting...' : 'Delete Photo'}
                </button>
            </div>
        </div>
    );
}
