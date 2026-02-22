'use client';

import Container from '../layout/Container';
import PhotoCard from './PhotoCard';

export default function ClusterDetail({ clusterName, photos, onBack }) {
    const filtered = photos.filter((p) => {
        const names = (p.clusters && p.clusters.length > 0) ? p.clusters : ['Uncategorized'];
        return names.includes(clusterName);
    });

    return (
        <>
            <Container className="pb-4">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                        Clusters
                    </button>
                    <span className="text-[var(--border)]">·</span>
                    <h2 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                        {clusterName}
                    </h2>
                    <span className="text-xs text-[var(--muted)]">
                        {filtered.length}
                    </span>
                </div>
            </Container>

            <Container className="pb-12">
                <div className="columns-2 sm:columns-3 lg:columns-4 gap-5 [&>*]:mb-5">
                    {filtered.map((photo) => (
                        <PhotoCard key={photo.id} photo={photo} readonly />
                    ))}
                </div>
            </Container>
        </>
    );
}
