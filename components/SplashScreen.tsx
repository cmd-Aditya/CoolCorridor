"use client";

import { useEffect, useState } from "react";

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const [mounted, setMounted] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        setMounted(true);

        const timer = setTimeout(() => {
            setFadeOut(true);
        }, 2000);

        const finishTimer = setTimeout(() => {
            onFinish();
        }, 2600);

        return () => {
            clearTimeout(timer);
            clearTimeout(finishTimer);
        };
    }, [onFinish]);

    // Prevent hydration mismatch – don’t render anything until client has mounted
    if (!mounted) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#0A0D08]" />
        );
    }

    return (
        <div
            className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0A0D08] transition-opacity duration-500 ${fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            {/* Logo */}
            <div className="mb-6">
                <img
                    src="/logo.png"
                    alt="CoolCorridor"
                    className="w-40 h-40 object-contain"
                />
            </div>

            {/* App Name */}
            <h1 className="text-3xl font-semibold tracking-wide text-[#C4B99A]">
                CoolCorridor
            </h1>

            {/* Tagline */}
            <p className="mt-2 text-sm tracking-[0.2em] uppercase text-[#7A9A6E] font-mono">
                Cooler Places. Brighter Days.
            </p>

            {/* Loading dots */}
            <div className="mt-10 flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7A9A6E] animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#7A9A6E] animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#7A9A6E] animate-pulse delay-150" />
            </div>
        </div>
    );
}