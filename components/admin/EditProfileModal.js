'use client';

import { useState } from 'react';

export default function EditProfileModal({ profile, onClose, onSaved }) {
    const [name, setName] = useState(profile.name || '');
    const [username, setUsername] = useState(profile.username || '');
    const [bio, setBio] = useState(profile.bio || '');
    const [saving, setSaving] = useState(false);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
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
            <div className="bg-white rounded-xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">Edit Profile</h2>

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
                            className="px-4 py-2 text-sm text-[var(--muted)] border border-[var(--border)] rounded-full hover:text-[var(--foreground)] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 text-sm font-medium text-white bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
