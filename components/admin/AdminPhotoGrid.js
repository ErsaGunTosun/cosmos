'use client';

import { useState, useId } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    SortableContext,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import AdminPhotoCard from './AdminPhotoCard';
import Container from '../layout/Container';
import Image from 'next/image';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';

export default function AdminPhotoGrid({ photos, onReorder, onEdit }) {
    const [activeId, setActiveId] = useState(null);
    const dndId = useId();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
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

        onReorder(oldIndex, newIndex);
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
                                    <AdminPhotoCard
                                        photo={photo}
                                        isDragging={photo.id === activeId}
                                        onEdit={() => onEdit(photo)}
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
