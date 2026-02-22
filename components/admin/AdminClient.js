'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@/components/layout/Container';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AdminPhotoGrid from '@/components/admin/AdminPhotoGrid';
import GridSkeleton from '@/components/gallery/GridSkeleton';
import EditProfileModal from '@/components/admin/EditProfileModal';
import UploadModal from '@/components/admin/UploadModal';

export default function AdminClient({ profile: initialProfile }) {
    const router = useRouter();
    const [photos, setPhotos] = useState([]);
    const [profile, setProfile] = useState(initialProfile);
    const [editProfile, setEditProfile] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [authed, setAuthed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth')
            .then(res => {
                if (!res.ok) router.push('/login');
                else setAuthed(true);
            });
    }, [router]);

    useEffect(() => {
        if (!authed) return;
        loadPhotos();
    }, [authed]);

    function loadPhotos() {
        fetch('/api/photos/order')
            .then(res => res.json())
            .then(data => { setPhotos(data); setLoading(false); });
    }

    function loadProfile() {
        fetch('/api/profile')
            .then(res => res.json())
            .then(data => setProfile(data));
    }

    function handleReorder(oldIndex, newIndex) {
        setPhotos(prev => {
            const next = [...prev];
            const [moved] = next.splice(oldIndex, 1);
            next.splice(newIndex, 0, moved);
            fetch('/api/photos/order', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ order: next.map(p => p.id) }),
            });
            return next;
        });
    }

    function handlePhotoClick(photo) {
        router.push(`/admin/photo/${photo.id}`);
    }

    if (!authed) return null;

    return (
        <main className="min-h-screen">
            <Container className="pt-12 pb-6">
                {/* Profile - tıklayınca düzenle */}
                <div onClick={() => setEditProfile(true)} className="cursor-pointer group">
                    <div className="relative">
                        <ProfileHeader profile={profile} elementCount={photos.length} />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-[var(--foreground)] bg-[var(--background)] shadow-sm px-3 py-1.5 rounded-full border border-[var(--border)]">
                                Edit Profile
                            </span>
                        </div>
                    </div>
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <button
                        onClick={() => setShowUpload(true)}
                        className="px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer"
                    >
                        + Add Photo
                    </button>
                    <a
                        href="/admin/settings"
                        className="px-4 py-2 text-sm font-medium text-[var(--muted)] border border-[var(--border)] rounded-full hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] transition-colors"
                    >
                        Settings
                    </a>
                    <a
                        href="/"
                        className="px-4 py-2 text-sm font-medium text-[var(--muted)] border border-[var(--border)] rounded-full hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] transition-colors"
                    >
                        View Site
                    </a>
                </div>

                <p className="text-center text-xs text-[var(--muted)]">
                    {photos.length} photos · Drag to reorder · Click to edit
                </p>
            </Container>

            {loading ? <GridSkeleton /> : (
                <AdminPhotoGrid
                    photos={photos}
                    onReorder={handleReorder}
                    onEdit={handlePhotoClick}
                />
            )}

            {editProfile && profile && (
                <EditProfileModal
                    profile={profile}
                    onClose={() => setEditProfile(false)}
                    onSaved={() => { setEditProfile(false); loadProfile(); }}
                />
            )}

            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploaded={() => { setShowUpload(false); loadPhotos(); }}
                />
            )}
        </main>
    );
}
