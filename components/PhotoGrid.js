import Image from 'next/image';

export default function PhotoGrid({ photos, view }) {
    return (
        <div className="max-w-[1200px] mx-auto px-6 pb-12">
            <div
                key={view}
                className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3 animate-fadeIn"
            >
                {photos.map((photo) => (
                    <div
                        key={photo.id}
                        className="break-inside-avoid cursor-pointer group"
                    >
                        <div className="relative overflow-hidden rounded-lg bg-gray-200">
                            <Image
                                src={photo.src}
                                alt="Photo"
                                width={300}
                                height={photo.height}
                                className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
