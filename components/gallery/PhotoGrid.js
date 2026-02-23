'use client';

import { useState, useId } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';

import PhotoCard from './PhotoCard';
import Container from '../layout/Container';
import Image from 'next/image';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

export default function PhotoGrid({ photos, onReorder, readonly = false }) {
    const dndId = useId();
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(TouchSensor, {
            // Mobilde kaydırma ile karışmaması için 250ms basılı tutma gerekli
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const activePhoto = activeId ? photos.find(p => p.id === activeId) : null;

    function handleDragStart(event) {
        setActiveId(event.active.id);
    }

    function handleDragEnd(event) {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = photos.findIndex(p => p.id === active.id);
        const newIndex = photos.findIndex(p => p.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return;

        onReorder?.(oldIndex, newIndex);
    }

    // Readonly: sadece grid, drag-drop yok
    if (readonly) {
        return (
            <Container className="pb-12">
                <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 640: 3, 1024: 4 }}>
                    <Masonry gutter="20px">
                        {photos.map((photo) => (
                            <div key={photo.id} className="mb-5">
                                <PhotoCard photo={photo} readonly />
                            </div>
                        ))}
                    </Masonry>
                </ResponsiveMasonry>
            </Container>
        );
    }

    return (
        <Container className="pb-12">
            <DndContext
                id={dndId}
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
                    <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 640: 3, 1024: 4 }}>
                        <Masonry gutter="20px">
                            {photos.map((photo) => (
                                <div key={photo.id} className="mb-5">
                                    <PhotoCard
                                        photo={photo}
                                        isDragging={photo.id === activeId}
                                    />
                                </div>
                            ))}
                        </Masonry>
                    </ResponsiveMasonry>
                </SortableContext>

                <DragOverlay adjustScale={false}>
                    {activePhoto ? (
                        <div className="rounded shadow-2xl opacity-90 overflow-hidden">
                            <Image
                                src={activePhoto.src}
                                alt="Dragging"
                                width={300}
                                height={300}
                                className="w-full h-auto block"
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </Container>
    );
}
