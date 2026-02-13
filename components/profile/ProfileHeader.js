export default function ProfileHeader({ profile, elementCount }) {
    // Skeleton
    if (!profile) {
        return (
            <div className="flex flex-col items-center text-center mb-8">
                <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse mb-4" />
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-40 bg-gray-200 animate-pulse rounded mt-2" />
                <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mt-3" />
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center text-center mb-8">
            {/* Avatar */}
            {profile.avatar_url ? (
                <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover mb-4"
                />
            ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-400 via-orange-400 to-pink-500 mb-4" />
            )}

            {/* Name */}
            <h1 className="text-2xl font-semibold text-[var(--foreground)] tracking-tight">
                {profile.name}
            </h1>

            {/* Username + Element Count */}
            <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-[var(--muted)]">@{profile.username}</span>
                <span className="text-[var(--muted)] text-xs">·</span>
                <span className="text-sm text-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">{elementCount}</span> elements
                </span>
            </div>

            {/* Bio */}
            {profile.bio && (
                <p className="text-sm text-[var(--muted)] mt-3 max-w-xs">
                    {profile.bio}
                </p>
            )}
        </div>
    );
}
