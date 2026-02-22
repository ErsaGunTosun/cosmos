'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function AdminPhotoCard({ photo, isDragging, onEdit }) {
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
            onEdit();
        }
        dragStartPos.current = null;
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`break-inside-avoid cursor-pointer group relative ${isDragging ? 'opacity-30' : ''
                }`}
            {...attributes}
            {...listeners}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
        >
            <Image
                src={photo.src}
                alt={photo.alt || 'Photo'}
                width={800}
                height={600}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="w-full h-auto block transition-all duration-300 group-hover:brightness-[0.6]"
                draggable={false}
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex items-center justify-center">
                <span className="text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    Edit
                </span>
            </div>

            {/* Meta badges */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                {photo.clusters && photo.clusters.length > 0 && (
                    <span className="text-[10px] text-white/80">{photo.clusters.join(', ')}</span>
                )}
                {photo.location && (
                    <span className="text-[10px] text-white/80">{photo.location}</span>
                )}
            </div>
        </div>
    );
}
