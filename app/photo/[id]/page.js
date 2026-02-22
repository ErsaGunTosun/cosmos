'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PhotoDetail({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [photo, setPhoto] = useState(null);
    const [imgLoaded, setImgLoaded] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    useEffect(() => {
        setImgLoaded(false);
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
            <div className="h-screen flex items-center justify-center bg-[var(--background)]">
                <div className="splash-content">
                    <h1 className="splash-title">Noir</h1>
                    <div className="splash-sub">
                        <span className="splash-star">✦</span>
                        <p className="splash-text">Made For Kedi Nur</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[100dvh] overflow-hidden flex flex-col lg:flex-row bg-[var(--background)]">
            {/* Sol: Fotoğraf Alanı */}
            <div className="relative flex-1 w-full h-full flex flex-col">
                {/* Mobile: Üst Header (Back + Info) */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between lg:hidden pointer-events-none">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-[var(--foreground)] bg-[var(--background)]/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm pointer-events-auto border border-[var(--border)]"
                    >
                        ← Back
                    </Link>
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="p-2 text-[var(--foreground)] bg-[var(--background)]/80 backdrop-blur-md rounded-full shadow-sm pointer-events-auto border border-[var(--border)]"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>

                {/* Desktop: Back Link */}
                <div className="hidden lg:block shrink-0 p-5 z-10">
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
                <div className="flex-1 flex items-center justify-center min-h-0 px-4 lg:px-12 pb-4 lg:pb-4 pt-20 lg:pt-0 relative">
                    <div className="relative w-full h-full max-w-5xl">
                        {!imgLoaded && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-xl bg-gray-200 animate-pulse" />
                            </div>
                        )}
                        <Image
                            src={photo.original_src || photo.src}
                            alt="Photo"
                            fill
                            className={`object-contain transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            priority
                            onLoad={() => setImgLoaded(true)}
                        />
                    </div>
                </div>

                {/* Navigasyon (Mobile & Desktop) */}
                <div className="shrink-0 flex items-center justify-center gap-8 pb-8 lg:pb-5 z-10 relative">
                    {photo.prev ? (
                        <Link
                            href={`/photo/${photo.prev}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-4 py-2"
                        >
                            ← Prev
                        </Link>
                    ) : <span className="text-sm text-transparent select-none px-4 py-2">← Prev</span>}

                    {photo.next ? (
                        <Link
                            href={`/photo/${photo.next}`}
                            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-4 py-2"
                        >
                            Next →
                        </Link>
                    ) : <span className="text-sm text-transparent select-none px-4 py-2">Next →</span>}
                </div>
            </div>

            {/* Sağ: Sidebar / Mobile Bottom Sheet */}
            <>
                {/* Mobile Backdrop */}
                {showInfo && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setShowInfo(false)}
                    />
                )}

                <div className={`
                    fixed lg:static inset-x-0 bottom-0 z-40 
                    bg-[var(--background)]
                    w-full lg:w-80 lg:shrink-0 
                    border-t lg:border-t-0 lg:border-l border-[var(--border)] 
                    p-6 flex flex-col gap-6 
                    transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1)
                    rounded-t-2xl lg:rounded-none shadow-2xl lg:shadow-none
                    min-h-[50vh] max-h-[85vh] lg:min-h-0 lg:max-h-none overflow-y-auto
                    ${showInfo ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
                `}>
                    {/* Mobile Pull Indicator */}
                    <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-2 lg:hidden" />

                    {/* Meta bilgiler */}
                    <div className="flex flex-col gap-4">
                        {photo.description && (
                            <div>
                                <p className="text-sm text-[var(--foreground)] italic whitespace-pre-wrap leading-relaxed">
                                    "{photo.description}"
                                </p>
                            </div>
                        )}

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

                    {/* EXIF bilgileri */}
                    {photo.exif_data && (
                        <>
                            <div className="h-px bg-[var(--border)]" />
                            <div>
                                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Camera Info</span>
                                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                                    {photo.exif_data.camera && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-[var(--muted)]">Camera</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.camera}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.lens && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-[var(--muted)]">Lens</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.lens}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.focalLength && (
                                        <div>
                                            <p className="text-xs text-[var(--muted)]">Focal Length</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.focalLength}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.aperture && (
                                        <div>
                                            <p className="text-xs text-[var(--muted)]">Aperture</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.aperture}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.shutter && (
                                        <div>
                                            <p className="text-xs text-[var(--muted)]">Shutter</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.shutter}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.iso && (
                                        <div>
                                            <p className="text-xs text-[var(--muted)]">ISO</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.iso}</p>
                                        </div>
                                    )}
                                    {photo.exif_data.date && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-[var(--muted)]">Date</p>
                                            <p className="text-sm text-[var(--foreground)]">
                                                {new Date(photo.exif_data.date).toLocaleDateString('tr-TR', {
                                                    year: 'numeric', month: 'long', day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {photo.exif_data.width && photo.exif_data.height && (
                                        <div className="col-span-2">
                                            <p className="text-xs text-[var(--muted)]">Resolution</p>
                                            <p className="text-sm text-[var(--foreground)]">{photo.exif_data.width} × {photo.exif_data.height}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    <div className="h-px bg-[var(--border)]" />

                    {photo.clusters && photo.clusters.length > 0 && (
                        <div>
                            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Clusters</span>
                            <div className="mt-2 flex flex-col gap-3">
                                {photo.clusters.map(cluster => (
                                    <div key={cluster} className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[var(--foreground)]/10 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-[var(--foreground)]">{cluster}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </>
        </div>
    );
}
