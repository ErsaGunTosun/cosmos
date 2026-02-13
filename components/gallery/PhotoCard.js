'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function Skeleton() {
    return (
        <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
    );
}

function PhotoImage({ photo, draggable = true }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {!loaded && <Skeleton />}
            <Image
                src={photo.src}
                alt={photo.alt || 'Photo'}
                width={800}
                height={600}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`w-full h-auto block transition-all duration-300 group-hover:brightness-[0.6] ${
                    loaded ? '' : 'invisible absolute'
                }`}
                draggable={!draggable ? undefined : false}
                onLoad={() => setLoaded(true)}
            />
        </>
    );
}

function HoverOverlay({ photo }) {
    return (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex flex-col justify-between p-3">
            {photo.cluster && (
                <span className="self-end text-xs font-medium text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded">
                    {photo.cluster}
                </span>
            )}
            {photo.location && (
                <span className="self-start text-xs font-medium text-white drop-shadow-md">
                    {photo.location}
                </span>
            )}
        </div>
    );
}

// Readonly card
function ReadonlyPhotoCard({ photo }) {
    return (
        <Link href={`/photo/${photo.id}`} className="break-inside-avoid block group relative">
            <PhotoImage photo={photo} draggable={false} />
            <HoverOverlay photo={photo} />
        </Link>
    );
}

// Draggable card
function DraggablePhotoCard({ photo, isDragging }) {
    const router = useRouter();
    const dragStartPos = useRef(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: photo.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    function handlePointerDown(e) {
        dragStartPos.current = { x: e.clientX, y: e.clientY };
        listeners?.onPointerDown?.(e);
    }

    function handleClick(e) {
        if (!dragStartPos.current) return;
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        const dy = Math.abs(e.clientY - dragStartPos.current.y);
        if (dx < 5 && dy < 5) {
            router.push(`/photo/${photo.id}`);
        }
        dragStartPos.current = null;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`break-inside-avoid cursor-pointer group relative ${
                isDragging ? 'opacity-30' : ''
            }`}
            {...attributes}
            {...listeners}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
        >
            <PhotoImage photo={photo} />
            <HoverOverlay photo={photo} />
        </div>
    );
}

export default function PhotoCard({ photo, isDragging, readonly }) {
    if (readonly) return <ReadonlyPhotoCard photo={photo} />;
    return <DraggablePhotoCard photo={photo} isDragging={isDragging} />;
}
