'use client';

import * as React from 'react';

export default function LoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black">
            <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-black/20 dark:bg-white/20" />
                <div className="relative h-16 w-16 animate-pulse rounded-full bg-black dark:bg-white" />
            </div>
        </div>
    );
}

