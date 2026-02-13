'use client';

import { useState, useEffect, useMemo } from 'react';
import Container from '@/components/layout/Container';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ViewSwitcher from '@/components/gallery/ViewSwitcher';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import GridSkeleton from '@/components/gallery/GridSkeleton';
import ClusterGrid from '@/components/gallery/ClusterGrid';
import ClusterDetail from '@/components/gallery/ClusterDetail';
import Footer from '@/components/layout/Footer';

export default function HomeClient({ profile }) {
    const [view, setView] = useState('elements');
    const [photos, setPhotos] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedCluster, setSelectedCluster] = useState(null);

    useEffect(() => {
        fetch('/api/photos/order')
            .then(res => res.json())
            .then(data => { setPhotos(data); setLoading(false); });

        fetch('/api/auth')
            .then(res => { if (res.ok) setIsAdmin(true); });
    }, []);

    const clusterCount = useMemo(() => {
        const names = new Set(photos.map(p => p.cluster || 'Uncategorized'));
        return names.size;
    }, [photos]);

    function handleViewChange(v) {
        setView(v);
        setSelectedCluster(null);
    }

    return (
        <main className="min-h-screen relative">
            {isAdmin && (
                <a
                    href="/admin"
                    className="fixed top-5 right-5 z-50 px-3 py-1.5 text-xs font-medium text-[var(--muted)] bg-white/80 backdrop-blur-sm border border-[var(--border)] rounded-full hover:text-[var(--foreground)] transition-colors"
                >
                    Admin
                </a>
            )}
            <Container className="pt-12 pb-6">
                <ProfileHeader profile={profile} elementCount={photos.length} />
                <ViewSwitcher
                    view={view}
                    setView={handleViewChange}
                    elementCount={photos.length}
                    clusterCount={clusterCount}
                />
            </Container>

            <div key={view + (selectedCluster || '')} className="animate-fadeIn">
                {view === 'elements' && (
                    loading ? <GridSkeleton /> : (
                        photos.length > 0 ? (
                            <PhotoGrid photos={photos} readonly />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
                                <p className="text-[var(--muted)] text-sm tracking-wide">No memories yet.</p>
                            </div>
                        )
                    )
                )}

                {view === 'clusters' && !loading && (
                    selectedCluster ? (
                        <ClusterDetail
                            clusterName={selectedCluster}
                            photos={photos}
                            onBack={() => setSelectedCluster(null)}
                        />
                    ) : (
                        photos.length > 0 ? (
                            <ClusterGrid
                                photos={photos}
                                onSelectCluster={setSelectedCluster}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center py-24 animate-fadeIn">
                                <p className="text-[var(--muted)] text-sm tracking-wide">No memories yet.</p>
                            </div>
                        )
                    )
                )}

                {view === 'clusters' && loading && <GridSkeleton />}
            </div>

            <Footer />
        </main>
    );
}
