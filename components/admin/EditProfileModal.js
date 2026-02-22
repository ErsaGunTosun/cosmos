'use client';

import { useState, useRef } from 'react';

export default function EditProfileModal({ profile, onClose, onSaved }) {
    const [name, setName] = useState(profile.name || '');
    const [username, setUsername] = useState(profile.username || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(profile.avatar_url || null);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileRef = useRef(null);

    function handleAvatarChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);

        // Avatar yükle
        if (avatarFile) {
            const formData = new FormData();
            formData.append('file', avatarFile);
            await fetch('/api/profile/avatar', { method: 'POST', body: formData });
        }

        // Profil bilgilerini güncelle
        await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, username, bio }),
        });

        setSaving(false);
        onSaved();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[var(--background)] rounded-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">Edit Profile</h2>

                    {/* Avatar */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="w-16 h-16 rounded-full overflow-hidden cursor-pointer shrink-0 border-2 border-dashed border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-400 via-orange-400 to-pink-500" />
                            )}
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="text-xs font-medium text-[var(--foreground)] hover:underline cursor-pointer"
                            >
                                Change Avatar
                            </button>
                            <p className="text-[10px] text-[var(--muted)] mt-0.5">JPG, PNG or WebP</p>
                        </div>
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Bio</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors resize-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-[var(--muted)] border border-[var(--border)] rounded-full hover:bg-[var(--foreground)]/5 hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-[var(--background)] bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
