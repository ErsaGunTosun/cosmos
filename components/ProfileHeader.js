'use client';

import { useState, useEffect } from 'react';

export default function ProfileHeader({ sdCardUsage, batteryLevel }) {
    const [animatedSD, setAnimatedSD] = useState(0);
    const [animatedBat, setAnimatedBat] = useState(0);

    useEffect(() => {
        // Animate SD card
        const sdTimer = setTimeout(() => {
            setAnimatedSD(sdCardUsage);
        }, 100);

        // Animate battery (0 to 100 then show infinity)
        const batTimer = setTimeout(() => {
            setAnimatedBat(100);
        }, 100);

        return () => {
            clearTimeout(sdTimer);
            clearTimeout(batTimer);
        };
    }, [sdCardUsage, batteryLevel]);

    return (
        <div className="flex items-center justify-between mb-6">
            {/* Left: Profile Info */}
            <div className="flex items-start gap-4">
                {/* Profile Photo - Gradient */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 via-orange-400 to-pink-500 flex-shrink-0" />

                {/* Name & Bio */}
                <div>
                    <h1 className="text-xl font-semibold text-black">faith</h1>
                    <p className="text-sm text-[#737373]">@faithme</p>
                    <p className="text-sm text-black mt-2">A person without skills</p>
                </div>
            </div>

            {/* Right: Camera Stats */}
            <div className="flex items-center gap-6">
                {/* Elements (Total Photos) */}
                <div className="flex flex-col items-end gap-1.5">
                    {/* SD Card Bar */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#737373] font-medium">SD</span>
                        <div className="w-12 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-black transition-all duration-1000 ease-out"
                                style={{ width: `${animatedSD}%` }}
                            />
                        </div>
                    </div>
                    <span className="text-sm">
                        <span className="font-semibold text-black">48</span>
                        <span className="text-[#737373] ml-1">Elements</span>
                    </span>
                </div>

                {/* Memory */}
                <div className="flex flex-col items-end gap-1.5">
                    {/* Infinity Bar */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-[#737373] font-medium">BAT</span>
                        <div className="w-12 h-3 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden relative">
                            {/* Loading bar */}
                            <div
                                className="absolute inset-0 bg-black transition-all duration-1000 ease-out"
                                style={{ width: `${animatedBat}%` }}
                            />
                            {/* Infinity symbol (shows after animation) */}
                            <span
                                className={`relative z-10 text-sm font-bold leading-none transition-all duration-300 ${animatedBat >= 100 ? 'text-white opacity-100' : 'text-black opacity-0'
                                    }`}
                            >
                                ∞
                            </span>
                        </div>
                    </div>
                    <span className="text-sm">
                        <span className="font-semibold text-black">∞</span>
                        <span className="text-[#737373] ml-1">Memory</span>
                    </span>
                </div>

                {/* Three-dot menu */}
                <button className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer border border-[#E5E5E5]">
                    <svg className="w-4 h-4 text-[#737373]" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="12" cy="19" r="2" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
