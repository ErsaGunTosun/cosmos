'use client';

import { useState, useRef } from 'react';

export default function UploadModal({ onClose, onUploaded }) {
    const [files, setFiles] = useState([]);
    const [cluster, setCluster] = useState('');
    const [location, setLocation] = useState('');
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    async function handleUpload(e) {
        e.preventDefault();
        if (files.length === 0) return;

        setUploading(true);

        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('cluster', cluster);
            formData.append('location', location);

            await fetch('/api/photos/upload', {
                method: 'POST',
                body: formData,
            });
        }

        setUploading(false);
        onUploaded();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleUpload} className="p-5 flex flex-col gap-4">
                    <h2 className="text-sm font-semibold text-[var(--foreground)]">Add Photos</h2>

                    {/* Drop zone */}
                    <div
                        onClick={() => inputRef.current?.click()}
                        className="border-2 border-dashed border-[var(--border)] rounded-lg p-8 text-center cursor-pointer hover:border-[var(--foreground)] transition-colors"
                    >
                        <p className="text-sm text-[var(--muted)]">
                            {files.length > 0
                                ? `${files.length} file${files.length > 1 ? 's' : ''} selected`
                                : 'Click to select photos'}
                        </p>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={e => setFiles(Array.from(e.target.files))}
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Cluster</label>
                        <input
                            type="text"
                            value={cluster}
                            onChange={e => setCluster(e.target.value)}
                            placeholder="e.g. Portraits"
                            className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Istanbul"
                            className="w-full mt-1 px-3 py-2 text-sm border border-[var(--border)] rounded-lg outline-none focus:border-[var(--foreground)] transition-colors"
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
                            disabled={uploading || files.length === 0}
                            className="px-4 py-2 text-sm font-medium text-white bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
