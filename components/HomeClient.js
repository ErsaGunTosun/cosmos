'use client';

import { useState, useEffect } from 'react';
import Container from '@/components/layout/Container';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ViewSwitcher from '@/components/gallery/ViewSwitcher';
import PhotoGrid from '@/components/gallery/PhotoGrid';
import GridSkeleton from '@/components/gallery/GridSkeleton';
import Footer from '@/components/layout/Footer';

export default function HomeClient({ profile }) {
    const [view, setView] = useState('elements');
    const [photos, setPhotos] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/photos/order')
            .then(res => res.json())
            .then(data => { setPhotos(data); setLoading(false); });

        fetch('/api/auth')
            .then(res => { if (res.ok) setIsAdmin(true); });
    }, []);

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
                    setView={setView}
                    elementCount={photos.length}
                    clusterCount={4}
                />
            </Container>

            {view === 'elements' && (
                loading ? <GridSkeleton /> : <PhotoGrid photos={photos} readonly />
            )}

            {view === 'clusters' && (
                <Container className="pb-12">
                    <p className="text-center text-[var(--muted)] text-sm py-20">
                        Clusters coming soon
                    </p>
                </Container>
            )}
            <Footer />
        </main>
    );
}
