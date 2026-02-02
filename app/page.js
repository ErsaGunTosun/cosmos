'use client';

import { useState } from 'react';
import ProfileHeader from '@/components/ProfileHeader';
import ActionButtons from '@/components/ActionButtons';
import NavigationSwitcher from '@/components/NavigationSwitcher';
import PhotoGrid from '@/components/PhotoGrid';

// Mock data
const MOCK_PHOTOS = [
  { id: 1, src: '/uploads/thumbnails/sample1.jpg', height: 400 },
  { id: 2, src: '/uploads/thumbnails/sample2.jpg', height: 600 },
  { id: 3, src: '/uploads/thumbnails/sample3.jpg', height: 350 },
  { id: 4, src: '/uploads/thumbnails/sample1.jpg', height: 500 },
  { id: 5, src: '/uploads/thumbnails/sample2.jpg', height: 400 },
  { id: 6, src: '/uploads/thumbnails/sample3.jpg', height: 550 },
];

export default function Home() {
  const [view, setView] = useState('elements');
  const sdCardUsage = 75; // SD card usage percentage
  const batteryLevel = 90; // Battery level percentage

  return (
    <main className="min-h-screen bg-[#F9F9F9]">
      {/* Header Section */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8 pb-6">
        <ProfileHeader sdCardUsage={sdCardUsage} batteryLevel={batteryLevel} />
        <NavigationSwitcher view={view} setView={setView} />
      </div>

      {/* Photo Grid */}
      <PhotoGrid photos={MOCK_PHOTOS} view={view} />
    </main>
  );
}
