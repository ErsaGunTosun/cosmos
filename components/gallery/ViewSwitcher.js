export default function ViewSwitcher({ view, setView, elementCount = 48, clusterCount = 4 }) {
    return (
        <div className="flex justify-center">
            <div className="relative grid grid-cols-2 bg-white rounded-full p-1 border border-[var(--border)]">
                {/* Sliding background */}
                <div
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-black rounded-full"
                    style={{
                        left: view === 'clusters' ? 'calc(50% + 0px)' : '4px',
                    }}
                />
                <button
                    onClick={() => setView('elements')}
                    className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        view === 'elements'
                            ? 'text-white'
                            : 'text-[var(--muted)] hover:text-black'
                    }`}
                >
                    Elements <span className="ml-1 text-xs opacity-70">{String(elementCount).padStart(2, '0')}</span>
                </button>
                <button
                    onClick={() => setView('clusters')}
                    className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                        view === 'clusters'
                            ? 'text-white'
                            : 'text-[var(--muted)] hover:text-black'
                    }`}
                >
                    Clusters <span className="ml-1 text-xs opacity-70">{String(clusterCount).padStart(2, '0')}</span>
                </button>
            </div>
        </div>
    );
}
