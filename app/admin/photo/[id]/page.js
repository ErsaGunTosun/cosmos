'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminPhotoEdit({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [photo, setPhoto] = useState(null);
    const [clusters, setClusters] = useState([]);
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Autocomplete states
    const [availableClusters, setAvailableClusters] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [clusterInput, setClusterInput] = useState('');
    const [showClusterDropdown, setShowClusterDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    useEffect(() => {
        fetch('/api/clusters').then(r => r.json()).then(data => setAvailableClusters(data.map(c => c.name)));
        fetch('/api/locations').then(r => r.json()).then(data => setAvailableLocations(data.map(l => l.name)));
    }, []);

    useEffect(() => {
        fetch(`/api/photos/${id}`)
            .then(res => res.json())
            .then(data => {
                setPhoto(data);
                setClusters(data.clusters || []);
                setLocation(data.location || '');
                setDescription(data.description || '');
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
        const finalClusters = [...clusters];
        if (clusterInput.trim() && !finalClusters.includes(clusterInput.trim())) {
            finalClusters.push(clusterInput.trim());
        }

        await fetch(`/api/photos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clusters: finalClusters, location, description }),
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

    const removeCluster = (c) => setClusters(clusters.filter(x => x !== c));

    if (!photo) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[var(--muted)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col lg:flex-row bg-[var(--background)]">
            {/* Sol: Fotoğraf */}
            <div className="flex-1 flex flex-col bg-transparent min-h-0">
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
                            src={photo.original_src || photo.src}
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
            <div className="w-full lg:w-80 shrink-0 border-l border-[var(--border)] bg-transparent p-6 flex flex-col gap-5 overflow-y-auto">
                <div className="text-xs text-[var(--muted)]">
                    {photo.src.split('/').pop()}
                </div>

                {/* Clusters Autocomplete */}
                <div>
                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Clusters (Categories)</label>
                    <div className="relative mt-1">
                        {clusters.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {clusters.map(c => (
                                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[var(--foreground)]/10 text-[var(--foreground)] rounded-full border border-[var(--border)]">
                                        {c}
                                        <button type="button" onClick={() => removeCluster(c)} className="hover:text-red-500 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <input
                            type="text"
                            value={clusterInput}
                            onChange={e => { setClusterInput(e.target.value); setShowClusterDropdown(true); }}
                            onFocus={() => setShowClusterDropdown(true)}
                            onBlur={() => setTimeout(() => setShowClusterDropdown(false), 200)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    const val = clusterInput.trim();
                                    if (val && !clusters.includes(val)) setClusters([...clusters, val]);
                                    setClusterInput('');
                                    setShowClusterDropdown(false);
                                }
                            }}
                            placeholder="Type and press Enter, e.g. Portraits"
                            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors bg-transparent text-[var(--foreground)]"
                        />

                        {showClusterDropdown && availableClusters.filter(c => c.toLowerCase().includes(clusterInput.toLowerCase()) && !clusters.includes(c)).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg max-h-[40vh] sm:max-h-60 overflow-y-auto">
                                {availableClusters.filter(c => c.toLowerCase().includes(clusterInput.toLowerCase()) && !clusters.includes(c)).map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => {
                                            setClusters([...clusters, c]);
                                            setClusterInput('');
                                            setShowClusterDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Location Autocomplete */}
                <div>
                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Location</label>
                    <div className="relative mt-1">
                        <input
                            type="text"
                            value={location}
                            onChange={e => { setLocation(e.target.value); setShowLocationDropdown(true); }}
                            onFocus={() => setShowLocationDropdown(true)}
                            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                            placeholder="e.g. Istanbul"
                            className="w-full px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors bg-transparent text-[var(--foreground)]"
                        />

                        {showLocationDropdown && availableLocations.filter(l => l.toLowerCase().includes(location.toLowerCase()) && l !== location).length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[var(--background)] border border-[var(--border)] rounded-lg shadow-lg max-h-[40vh] sm:max-h-60 overflow-y-auto">
                                {availableLocations.filter(l => l.toLowerCase().includes(location.toLowerCase()) && l !== location).map(l => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => {
                                            setLocation(l);
                                            setShowLocationDropdown(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer"
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Description Textarea */}
                <div>
                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Description</label>
                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Write a description or a memory..."
                        rows={4}
                        className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors bg-transparent text-[var(--foreground)] resize-none"
                    />
                </div>

                <div className="h-px bg-[var(--border)]" />

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full py-2.5 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>

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
