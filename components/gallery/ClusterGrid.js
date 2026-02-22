'use client';

import Image from 'next/image';
import { useState } from 'react';
import Container from '../layout/Container';

function ClusterCard({ cluster, onClick }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div
            onClick={() => onClick(cluster.name)}
            className="group cursor-pointer"
        >
            {/* Cover image */}
            <div className="relative overflow-hidden rounded-md aspect-square">
                {!loaded && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                )}
                <Image
                    src={cluster.cover}
                    alt={cluster.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={`object-cover transition-all duration-300 group-hover:brightness-[0.7] ${loaded ? '' : 'invisible'
                        }`}
                    onLoad={() => setLoaded(true)}
                />
            </div>

            {/* Label */}
            <div className="mt-2.5 px-0.5">
                <h3 className="text-sm font-semibold text-[var(--foreground)] tracking-tight">
                    {cluster.name}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                    {String(cluster.count).padStart(2, '0')} {cluster.count === 1 ? 'element' : 'elements'}
                </p>
            </div>
        </div>
    );
}

export default function ClusterGrid({ photos, onSelectCluster }) {
    // Group photos by cluster
    const clusterMap = {};
    photos.forEach((photo) => {
        const names = (photo.clusters && photo.clusters.length > 0) ? photo.clusters : ['Uncategorized'];
        names.forEach(name => {
            if (!clusterMap[name]) {
                clusterMap[name] = { name, cover: photo.src, count: 0 };
            }
            clusterMap[name].count++;
        });
    });

    const clusters = Object.values(clusterMap);

    if (clusters.length === 0) {
        return (
            <Container className="pb-12">
                <p className="text-center text-[var(--muted)] text-sm py-20">
                    No clusters yet
                </p>
            </Container>
        );
    }

    return (
        <Container className="pb-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {clusters.map((cluster) => (
                    <ClusterCard
                        key={cluster.name}
                        cluster={cluster}
                        onClick={onSelectCluster}
                    />
                ))}
            </div>
        </Container>
    );
}
