'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const observer = useRef();
    const loadMoreRef = useCallback(node => {
        if (loading || loadingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, loadingMore, hasMore]);

    useEffect(() => {
        if (page === 1) setLoading(true);
        else setLoadingMore(true);

        fetch(`/api/photos/order?page=${page}&limit=24`)
            .then(res => res.json())
            .then(data => {
                if (data.length < 24) setHasMore(false);
                setPhotos(prev => {
                    const newPhotos = data.filter(d => !prev.some(p => p.id === d.id));
                    return page === 1 ? data : [...prev, ...newPhotos];
                });
                setLoading(false);
                setLoadingMore(false);
            });
    }, [page]);

    useEffect(() => {
        fetch('/api/auth')
            .then(res => { if (res.ok) setIsAdmin(true); });
    }, []);

    const clusterCount = useMemo(() => {
        const names = new Set();
        photos.forEach(p => {
            if (p.clusters && p.clusters.length > 0) {
                p.clusters.forEach(c => names.add(c));
            } else {
                names.add('Uncategorized');
            }
        });
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
                    className="fixed top-5 right-5 z-50 px-3 py-1.5 text-xs font-medium text-[var(--muted)] bg-[var(--background)]/80 backdrop-blur-md border border-[var(--border)] rounded-full hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] transition-colors"
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
                            <>
                                <PhotoGrid photos={photos} readonly />
                                {hasMore && (
                                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                                        <div className="w-5 h-5 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin opacity-50"></div>
                                    </div>
                                )}
                            </>
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
