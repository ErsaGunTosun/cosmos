export default function ActionButtons() {
    return (
        <div className="flex items-center justify-between mb-8">
            {/* Left: Edit Profile */}
            <button className="px-4 py-2 bg-white rounded-full text-sm font-medium text-black hover:bg-gray-50 transition-colors border border-[#E5E5E5]">
                Edit Profile
            </button>

            {/* Right: Organize */}
            <button className="px-4 py-2 bg-white rounded-full text-sm font-medium text-black hover:bg-gray-50 transition-colors border border-[#E5E5E5]">
                Organize
            </button>
        </div>
    );
}
