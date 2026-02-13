'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PhotoDetail({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [photo, setPhoto] = useState(null);

    useEffect(() => {
        fetch(`/api/photos/${id}`)
            .then(res => res.json())
            .then(data => setPhoto(data));
    }, [id]);

    useEffect(() => {
        function handleKey(e) {
            if (!photo) return;
            if (e.key === 'ArrowLeft' && photo.prev) router.push(`/photo/${photo.prev}`);
            if (e.key === 'ArrowRight' && photo.next) router.push(`/photo/${photo.next}`);
            if (e.key === 'Escape') router.push('/');
        }
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [photo, router]);

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
                {/* Üst bar */}
                <div className="shrink-0 p-5">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                </div>

                {/* Fotoğraf */}
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

                {/* Alt: Navigasyon */}
                <div className="shrink-0 flex items-center justify-center gap-4 pb-5">
                    {photo.prev ? (
                        <Link
                            href={`/photo/${photo.prev}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            ← Prev
                        </Link>
                    ) : <span className="text-sm text-transparent select-none">← Prev</span>}

                    {photo.next ? (
                        <Link
                            href={`/photo/${photo.next}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                        >
                            Next →
                        </Link>
                    ) : <span className="text-sm text-transparent select-none">Next →</span>}
                </div>
            </div>

            {/* Sağ: Sidebar */}
            <div className="w-full lg:w-80 shrink-0 border-l border-[var(--border)] bg-white p-6 flex flex-col gap-6">
                {/* Üst butonlar */}
                <div className="flex items-center justify-end gap-2">
                    <button className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <svg className="w-4 h-4 text-[var(--muted)]" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                        </svg>
                    </button>
                </div>

                {/* Meta bilgiler */}
                <div className="flex flex-col gap-4">
                    {photo.location && (
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Location</span>
                            <p className="text-sm text-[var(--foreground)] mt-1">{photo.location}</p>
                        </div>
                    )}

                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">File</span>
                        <p className="text-sm text-[var(--muted)] mt-1">{photo.src.split('/').pop()}</p>
                    </div>
                </div>

                <div className="h-px bg-[var(--border)]" />

                {photo.cluster && (
                    <div>
                        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Cluster</span>
                        <div className="mt-2 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-[var(--foreground)]">{photo.cluster}</p>
                                <p className="text-xs text-[var(--muted)]">@faithme</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
