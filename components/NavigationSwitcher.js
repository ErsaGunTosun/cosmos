export default function NavigationSwitcher({ view, setView }) {
    return (
        <div className="flex justify-center">
            <div className="relative inline-flex bg-white rounded-full p-1 border border-[#E5E5E5]">
                {/* Sliding background */}
                <div
                    className={`absolute top-1 bottom-1 bg-black rounded-full transition-all duration-300 ease-out ${view === 'elements' ? 'left-1 right-[calc(50%+2px)]' : 'left-[calc(50%+2px)] right-1'
                        }`}
                />
                <button
                    onClick={() => setView('elements')}
                    className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'elements'
                        ? 'text-white'
                        : 'text-[#737373] hover:text-black hover:bg-gray-50'
                        } cursor-pointer`}
                >
                    Elements <span className="ml-1.5 text-xs opacity-70">48</span>
                </button>
                <button
                    onClick={() => setView('clusters')}
                    className={`relative z-10 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${view === 'clusters'
                        ? 'text-white'
                        : 'text-[#737373] hover:text-black hover:bg-gray-50'
                        } cursor-pointer`}
                >
                    Clusters <span className="ml-1.5 text-xs opacity-70">04</span>
                </button>
            </div>
        </div>
    );
}
