'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

export default function UploadModal({ onClose, onUploaded }) {
    // Array of objects: { id, file, clusters: [], location: '', description: '', preview: string }
    const [fileConfigs, setFileConfigs] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(-1); // -1 means "Select Files" step
    const [uploading, setUploading] = useState(false);
    const inputRef = useRef(null);

    // Autocomplete available data
    const [availableClusters, setAvailableClusters] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);

    // Input UI states for the currently active config (Dropdown & Input Box states)
    const [clusterInput, setClusterInput] = useState('');
    const [showClusterDropdown, setShowClusterDropdown] = useState(false);
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);

    useEffect(() => {
        fetch('/api/clusters').then(r => r.json()).then(data => setAvailableClusters(data.map(c => c.name)));
        fetch('/api/locations').then(r => r.json()).then(data => setAvailableLocations(data.map(l => l.name)));
    }, []);

    // Handle initial file selection (Multiple files allowed)
    function handleFileChange(e) {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length === 0) return;

        const newConfigs = selectedFiles.map((file, i) => ({
            id: Date.now() + i, // temp unique identifier
            file: file,
            preview: URL.createObjectURL(file), // create front-end preview instantly
            clusters: [],
            location: '',
            description: ''
        }));

        setFileConfigs(newConfigs);
        setCurrentIndex(0); // Proceed to Configuration Phase (Step 2)
    }

    // Helper: Update a field in the currently active file config
    function updateActiveConfig(key, value) {
        setFileConfigs(prev => {
            const copy = [...prev];
            copy[currentIndex] = { ...copy[currentIndex], [key]: value };
            return copy;
        });
    }

    // Cluster management for current file config
    function addCluster(val) {
        if (!val) return;
        setFileConfigs(prev => {
            const currentClusters = prev[currentIndex].clusters;
            if (currentClusters.includes(val)) return prev;
            const copy = [...prev];
            copy[currentIndex] = { ...copy[currentIndex], clusters: [...currentClusters, val] };
            return copy;
        });
    }

    function removeCluster(c) {
        setFileConfigs(prev => {
            const currentClusters = prev[currentIndex].clusters;
            const copy = [...prev];
            copy[currentIndex] = { ...copy[currentIndex], clusters: currentClusters.filter(x => x !== c) };
            return copy;
        });
    }

    // Loop through ALL configured files and post them.
    async function handleUpload(e) {
        e.preventDefault();
        if (fileConfigs.length === 0) return;

        setUploading(true);

        // Before uploading, capture any dangling cluster input on the CURRENT photo
        const activeConfig = fileConfigs[currentIndex];
        const finalClusters = [...activeConfig.clusters];
        if (clusterInput.trim() && !finalClusters.includes(clusterInput.trim())) {
            finalClusters.push(clusterInput.trim());
        }

        const uploadQueue = fileConfigs.map((cfg, idx) => {
            if (idx === currentIndex) {
                return { ...cfg, clusters: finalClusters };
            }
            return cfg;
        });

        // Fire all POST requests sequentially
        for (const config of uploadQueue) {
            const formData = new FormData();
            formData.append('file', config.file);
            formData.append('clusters', config.clusters.join(','));
            formData.append('location', config.location);
            formData.append('description', config.description);

            await fetch('/api/photos/upload', {
                method: 'POST',
                body: formData,
            });
        }

        setUploading(false);
        // Free object memory
        fileConfigs.forEach(c => URL.revokeObjectURL(c.preview));
        onUploaded();
    }

    const currentConfig = currentIndex >= 0 ? fileConfigs[currentIndex] : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-hidden" onClick={onClose}>
            <div className={`bg-[var(--background)] rounded-xl w-full ${currentIndex === -1 ? 'max-w-md' : 'max-w-4xl h-full md:h-auto max-h-full md:max-h-[90vh]'} mx-auto overflow-hidden flex flex-col transition-all duration-300 shadow-2xl`} onClick={e => e.stopPropagation()}>

                {/* STEP 1: Select Files Screen */}
                {currentIndex === -1 ? (
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h2 className="text-sm font-semibold text-[var(--foreground)]">New Multi-Upload</h2>
                            <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&times;</button>
                        </div>

                        <div
                            onClick={() => inputRef.current?.click()}
                            className="border-2 border-dashed border-[var(--border)] bg-[var(--foreground)]/5 rounded-xl p-12 text-center cursor-pointer hover:border-[var(--foreground)] hover:bg-[var(--foreground)]/10 transition-colors"
                        >
                            <svg className="w-8 h-8 mx-auto text-[var(--muted)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <p className="text-sm font-medium text-[var(--foreground)] mb-1">Select one or more photos</p>
                            <p className="text-xs text-[var(--muted)]">Drag and drop also available behind the scenes.</p>

                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                ) : (
                    /* STEP 2: Carousel Configurator Screen */
                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row h-full w-full overflow-hidden">

                        {/* LEFT/TOP PANE: Image Preview & Steps */}
                        <div className="relative shrink-0 md:flex-1 bg-black/5 dark:bg-black/20 border-b md:border-b-0 md:border-r border-[var(--border)] p-4 md:p-6 flex flex-col items-center justify-center h-[35vh] min-h-[200px] md:h-auto md:min-h-[60vh]">
                            {/* Top Nav (Mobile & Desktop shared element) */}
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 bg-[var(--background)]/80 backdrop-blur-md text-[var(--foreground)] rounded-full border border-[var(--border)] shadow-sm">
                                    Photo {currentIndex + 1} of {fileConfigs.length}
                                </span>
                                <button type="button" onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-md rounded-full border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)] md:hidden shadow-sm">&times;</button>
                            </div>

                            {/* The Image */}
                            <div className="relative w-full h-full flex items-center justify-center mt-6 md:mt-0 overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentConfig.preview}
                                    alt="Preview"
                                    className="w-auto h-auto max-w-full max-h-full object-contain rounded-md drop-shadow-xl"
                                />
                            </div>

                            {/* Desktop Navigation Arrows inside Preview Pane */}
                            <div className="hidden md:flex items-center gap-4 mt-6">
                                <button
                                    type="button"
                                    disabled={currentIndex === 0}
                                    onClick={() => { setClusterInput(''); setCurrentIndex(prev => prev - 1); }}
                                    className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-[var(--background)] disabled:hover:text-[var(--foreground)] transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div className="flex gap-2.5 px-2 overflow-x-auto scrollbar-hide">
                                    {fileConfigs.map((cfg, idx) => (
                                        <div
                                            key={cfg.id}
                                            onClick={() => { setClusterInput(''); setCurrentIndex(idx); }}
                                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 cursor-pointer transition-all duration-300 ${idx === currentIndex ? 'bg-[var(--foreground)] scale-150' : 'bg-[var(--border)] hover:bg-[var(--muted)]'}`}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    disabled={currentIndex === fileConfigs.length - 1}
                                    onClick={() => { setClusterInput(''); setCurrentIndex(prev => prev + 1); }}
                                    className="p-2.5 rounded-full bg-[var(--background)] border border-[var(--border)] hover:bg-[var(--foreground)] hover:text-[var(--background)] text-[var(--foreground)] disabled:opacity-30 disabled:hover:bg-[var(--background)] disabled:hover:text-[var(--foreground)] transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* RIGHT PANE: Settings Form for the Active Configuration */}
                        <div className="w-full md:w-96 flex flex-col flex-1 min-h-0 bg-[var(--background)]">
                            <div className="flex items-center justify-between p-4 md:p-5 border-b border-[var(--border)] shrink-0 hidden md:flex">
                                <h3 className="text-sm font-semibold text-[var(--foreground)]">Edit Details</h3>
                                <button type="button" onClick={onClose} className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">&times;</button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-6">

                                {/* Clusters Multiselect */}
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Clusters (Categories)</label>
                                    <div className="relative mt-2">
                                        {currentConfig.clusters.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {currentConfig.clusters.map(c => (
                                                    <span key={c} className="flex items-center gap-1 px-2.5 py-1 text-xs bg-[var(--foreground)] text-[var(--background)] rounded-full font-medium">
                                                        {c}
                                                        <button type="button" onClick={() => removeCluster(c)} className="hover:text-red-300 opacity-80 hover:opacity-100 transition-opacity ml-1">&times;</button>
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
                                                    if (val) addCluster(val);
                                                    setClusterInput('');
                                                    setShowClusterDropdown(false);
                                                }
                                            }}
                                            placeholder="Add category (Enter)"
                                            className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-xl outline-none focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all bg-transparent text-[var(--foreground)]"
                                        />

                                        {showClusterDropdown && availableClusters.filter(c => c.toLowerCase().includes(clusterInput.toLowerCase()) && !currentConfig.clusters.includes(c)).length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl max-h-[30vh] md:max-h-60 overflow-y-auto overflow-hidden">
                                                {availableClusters.filter(c => c.toLowerCase().includes(clusterInput.toLowerCase()) && !currentConfig.clusters.includes(c)).map(c => (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => {
                                                            addCluster(c);
                                                            setClusterInput('');
                                                            setShowClusterDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors border-b border-[var(--border)] last:border-0"
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Location</label>
                                    <div className="relative mt-2">
                                        <input
                                            type="text"
                                            value={currentConfig.location}
                                            onChange={e => { updateActiveConfig('location', e.target.value); setShowLocationDropdown(true); }}
                                            onFocus={() => setShowLocationDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                                            placeholder="Where was this taken?"
                                            className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-xl outline-none focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all bg-transparent text-[var(--foreground)]"
                                        />

                                        {showLocationDropdown && availableLocations.filter(l => l.toLowerCase().includes(currentConfig.location.toLowerCase()) && l !== currentConfig.location).length > 0 && (
                                            <div className="absolute z-40 w-full mt-2 bg-[var(--background)] border border-[var(--border)] rounded-xl shadow-2xl max-h-[30vh] md:max-h-60 overflow-y-auto overflow-hidden">
                                                {availableLocations.filter(l => l.toLowerCase().includes(currentConfig.location.toLowerCase()) && l !== currentConfig.location).map(l => (
                                                    <button
                                                        key={l}
                                                        type="button"
                                                        onClick={() => {
                                                            updateActiveConfig('location', l);
                                                            setShowLocationDropdown(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors border-b border-[var(--border)] last:border-0"
                                                    >
                                                        {l}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-[var(--muted)] font-medium">Description</label>
                                    <textarea
                                        value={currentConfig.description}
                                        onChange={e => updateActiveConfig('description', e.target.value)}
                                        placeholder="Write a caption or memory..."
                                        rows={4}
                                        className="w-full mt-2 px-4 py-3 text-sm border border-[var(--border)] rounded-xl outline-none focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] transition-all bg-transparent text-[var(--foreground)] resize-none"
                                    />
                                </div>
                            </div>

                            {/* ACTION BUTTONS (Sticky footer) */}
                            <div className="shrink-0 p-4 border-t border-[var(--border)] bg-[var(--background)] z-10 pb-san">

                                {/* Mobile Mini Nav Before Button */}
                                <div className="flex md:hidden items-center justify-between mb-4">
                                    <button type="button" disabled={currentIndex === 0} onClick={() => { setClusterInput(''); setCurrentIndex(prev => prev - 1); }} className="px-4 py-2 text-xs font-semibold bg-[var(--border)] text-[var(--foreground)] rounded-full disabled:opacity-30">← PREV</button>
                                    <div className="flex gap-1.5">
                                        {fileConfigs.map((cfg, idx) => (
                                            <div key={cfg.id} className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[var(--foreground)] scale-125' : 'bg-[var(--border)]'}`} />
                                        ))}
                                    </div>
                                    <button type="button" disabled={currentIndex === fileConfigs.length - 1} onClick={() => { setClusterInput(''); setCurrentIndex(prev => prev + 1); }} className="px-4 py-2 text-xs font-semibold bg-[var(--border)] text-[var(--foreground)] rounded-full disabled:opacity-30">NEXT →</button>
                                </div>

                                {/* Main CTAs */}
                                <div className="flex gap-3">
                                    {currentIndex < fileConfigs.length - 1 ? (
                                        <>
                                            <button type="button" onClick={onClose} className="px-5 py-3 text-sm font-medium border border-[var(--border)] rounded-full text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors">
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => { setClusterInput(''); setCurrentIndex(prev => prev + 1); }}
                                                className="flex-1 px-5 py-3 text-sm font-semibold text-[var(--background)] bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity shadow-md"
                                            >
                                                Next Photo →
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="w-full px-5 py-3.5 text-sm font-semibold text-[var(--background)] bg-[var(--foreground)] rounded-full hover:opacity-90 transition-opacity shadow-xl disabled:opacity-50"
                                        >
                                            {uploading ? 'Processing All...' : `Upload All (${fileConfigs.length})`}
                                        </button>
                                    )}
                                </div>
                            </div>

                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
