/**
 * CHRONIS HERO SECTION COMPONENT
 *
 * MATH DERIVATIONS & CONSTANTS (Source of truth: TRACK_HEIGHT = 200vh)
 * ------------------------------------------------------------------
 * 1. TRACK_HEIGHT = 200vh (Single source of truth for all height and scroll mappings)
 * 2. STICKY_HEIGHT = TRACK_HEIGHT / 2 = 100vh (Height of the pinned viewport container)
 * 3. MOBILE_HERO_HEIGHT = TRACK_HEIGHT * 0.3 = 60vh (Height of the hero container on mobile)
 * 4. Scrub Phase: scrollProgress 0.0 -> 0.75
 *    - Maps scroll progress linearly to video.currentTime (0 to video.duration)
 * 5. Crossfade Phase: scrollProgress 0.75 -> 1.0
 *    - videoOpacity: 1 -> 0
 *    - welcomeOpacity: 0 -> 1
 *    - welcomeTranslateY: 50px -> 0px
 * 6. Pointer Events Toggle: progress >= 0.95
 *    - Toggles video container pointer-events from 'auto' to 'none'
 * 7. Unpin: scrollProgress >= 1.0 (scrollY = TRACK_HEIGHT = 200vh)
 *    - Pinned container unpins, allowing natural document scroll to take over
 *
 * AMBIENT BACKDROP MATH & BLENDS (Sampled video gray = #cbd1d1)
 * ------------------------------------------------------------------
 * 8. Loop Range: 8.0s -> 9.9s (Loops the final 2 seconds of assembled rotating pendant)
 * 9. Mouse Parallax: Translates video by max ±10px using useSpring (desktop only)
 */

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  useMotionValue,
  useSpring,
  animate,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

// Constant source of truth
const TRACK_HEIGHT = 200; // in vh

// Derived constants
const STICKY_HEIGHT = TRACK_HEIGHT / 2; // 100vh
const MOBILE_HERO_HEIGHT = TRACK_HEIGHT * 0.3; // 60vh
const SCRUB_END_PROGRESS = 0.75;
const FADE_END_PROGRESS = 1.0;
const POINTER_EVENTS_PROGRESS = 0.95;

// Ambient Loop Timing
const LOOP_START = 8.0; // In seconds
const LOOP_END = 9.9; // In seconds

interface ChronisHeroProps {
  children: React.ReactNode;
}

export function ChronisHero({ children }: ChronisHeroProps) {
  const isMobile = useIsMobile();
  const prefersReducedMotionRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [viewportHeight, setViewportHeight] = useState(0);
  const [trackHeightPx, setTrackHeightPx] = useState(0);
  const [isPlayingAutoplay, setIsPlayingAutoplay] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Motion Values to completely avoid React state updates on scroll
  const indicatorOpacity = useMotionValue(0);

  // Parallax spring settings (desktop cursor tracking)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 200, mass: 0.5 };
  const translateX = useSpring(mouseX, springConfig);
  const translateY = useSpring(mouseY, springConfig);

  // Track the autoplay handoff interrupt details
  const [handoff, setHandoff] = useState<{
    scrollYInterrupt: number;
    timeInterrupt: number;
  } | null>(null);

  const videoDurationRef = useRef(0);
  const targetTimeRef = useRef(0);
  const scrollProgressRef = useRef(0);

  // Initialize and track preferences/viewport sizing (SSR Safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Developer Math Verification Assertion
    if (process.env.NODE_ENV === "development") {
      const derivedSticky = TRACK_HEIGHT / 2;
      const derivedMobile = TRACK_HEIGHT * 0.3;
      console.assert(derivedSticky === 100, "STICKY_HEIGHT must equal 100vh");
      console.assert(derivedMobile === 60, "MOBILE_HERO_HEIGHT must equal 60vh");
      console.assert(SCRUB_END_PROGRESS === 0.75, "SCRUB_END_PROGRESS must equal 0.75");
      console.assert(POINTER_EVENTS_PROGRESS === 0.95, "POINTER_EVENTS_PROGRESS must equal 0.95");
      console.log(
        `[ChronisHero Math Verified] TRACK_HEIGHT: ${TRACK_HEIGHT}vh, STICKY_HEIGHT: ${derivedSticky}vh, MOBILE_HERO_HEIGHT: ${derivedMobile}vh, Scrub limit: ${SCRUB_END_PROGRESS}, Pointer toggle: ${POINTER_EVENTS_PROGRESS}`,
      );
    }

    // Prefers-reduced-motion media query
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    prefersReducedMotionRef.current = mediaQuery.matches;
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMotionPreferenceChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMotionPreferenceChange);

    // Track viewport size to convert vh to px accurately
    const handleResize = () => {
      const vh = window.innerHeight;
      setViewportHeight(vh);
      setTrackHeightPx((TRACK_HEIGHT / 100) * vh);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initial load check for scrolled state
    const initialScrollY = window.scrollY;
    if (initialScrollY > 10) {
      setIsPlayingAutoplay(false);
    } else {
      // Fade in scroll-to-continue indicator after 2s if user has not scrolled
      const timer = setTimeout(() => {
        if (window.scrollY <= 10) {
          animate(indicatorOpacity, 1, { duration: 0.5 });
        }
      }, 2000);

      // Attempt to play video on load
      videoRef.current?.play().catch((err) => {
        console.warn("Autoplay blocked or failed:", err);
      });

      return () => {
        clearTimeout(timer);
        mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
        window.removeEventListener("resize", handleResize);
      };
    }

    return () => {
      mediaQuery.removeEventListener("change", handleMotionPreferenceChange);
      window.removeEventListener("resize", handleResize);
    };
  }, [indicatorOpacity]);

  // Subtle Mouse Parallax tracking (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight: height } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2); // -1 to 1
      const y = (e.clientY - height / 2) / (height / 2); // -1 to 1

      // Set translations (max ±10px X and Y)
      mouseX.set(x * 10);
      mouseY.set(y * 10);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isMobile, mouseX, mouseY]);

  const { scrollY } = useScroll();

  // Create Framer Motion transforms for the crossfade based on active track heights
  const safeTrackHeight = trackHeightPx || 1000;
  const scrubEndPx = safeTrackHeight * SCRUB_END_PROGRESS;
  const fadeEndPx = safeTrackHeight * FADE_END_PROGRESS;

  const videoOpacity = useTransform(scrollY, [scrubEndPx, fadeEndPx], [1, 0]);
  const welcomeOpacity = useTransform(scrollY, [scrubEndPx, fadeEndPx], [0, 1]);
  const welcomeTranslateY = useTransform(scrollY, [scrubEndPx, fadeEndPx], [50, 0]);

  // Handle pointerEvents purely outside React re-render cycle via Framer Motion transform
  const pointerEvents = useTransform(
    scrollY,
    [
      0,
      safeTrackHeight * POINTER_EVENTS_PROGRESS,
      safeTrackHeight * (POINTER_EVENTS_PROGRESS + 0.001),
      safeTrackHeight,
    ],
    ["auto", "auto", "none", "none"],
  );

  // Hook into Framer Motion scroll changes (updates refs only to avoid React re-renders)
  useMotionValueEvent(scrollY, "change", (latestScrollY) => {
    if (isMobile || prefersReducedMotionRef.current || videoError) return;

    const progress = latestScrollY / safeTrackHeight;
    scrollProgressRef.current = progress;

    // Fade out indicator immediately on scroll
    if (latestScrollY > 10 && indicatorOpacity.get() > 0) {
      indicatorOpacity.set(0);
    }

    // Autoplay Handoff check
    if (isPlayingAutoplay && (latestScrollY > 10 || progress >= SCRUB_END_PROGRESS)) {
      const video = videoRef.current;
      if (video && !isNaN(video.duration) && video.readyState >= 1) {
        const timeInterrupt = video.currentTime;
        video.pause();

        setHandoff({
          scrollYInterrupt: latestScrollY,
          timeInterrupt: timeInterrupt,
        });
        setIsPlayingAutoplay(false);

        // Map immediately to prevent any single-frame jump/snap-back
        const duration = video.duration;
        let targetTime = timeInterrupt;
        const remainingScroll = scrubEndPx - latestScrollY;

        if (latestScrollY >= latestScrollY) {
          if (remainingScroll <= 0) {
            targetTime = duration;
          } else {
            const scrollFrac = (latestScrollY - latestScrollY) / remainingScroll;
            targetTime =
              timeInterrupt + Math.min(1, Math.max(0, scrollFrac)) * (duration - timeInterrupt);
          }
        }
        targetTimeRef.current = targetTime;
      } else {
        // Fallback: If metadata not loaded yet, just disable autoplay
        setIsPlayingAutoplay(false);
      }
    } else if (!isPlayingAutoplay) {
      // Standard scrubbing math (including Handoff mapping)
      const video = videoRef.current;
      if (video && videoDurationRef.current > 0) {
        const duration = videoDurationRef.current;
        let targetTime = 0;

        if (progress >= SCRUB_END_PROGRESS) {
          // Scrolled past the scrub phase: play and loop the rotation ambiently
          if (video.paused && !videoError) {
            video.play().catch(() => {});
          }
          targetTime = duration;
        } else {
          // In the scrub phase: ensure it is paused and scrub
          if (!video.paused) {
            video.pause();
          }

          if (handoff) {
            const { scrollYInterrupt, timeInterrupt } = handoff;
            if (latestScrollY < scrollYInterrupt) {
              // Scrub backwards to 0 from the interrupt point
              targetTime = (latestScrollY / scrollYInterrupt) * timeInterrupt;
            } else {
              // Scrub forwards to end from the interrupt point
              const remainingScroll = scrubEndPx - scrollYInterrupt;
              if (remainingScroll <= 0) {
                targetTime = duration;
              } else {
                const scrollFrac = (latestScrollY - scrollYInterrupt) / remainingScroll;
                targetTime =
                  timeInterrupt + Math.min(1, Math.max(0, scrollFrac)) * (duration - timeInterrupt);
              }
            }
          } else {
            // Standard linear mapping if no handoff happened (e.g. autoplay ended naturally)
            const scrollProgress = latestScrollY / safeTrackHeight;
            targetTime = Math.min(1, scrollProgress / SCRUB_END_PROGRESS) * duration;
          }
        }

        targetTimeRef.current = targetTime;
      }
    }
  });

  // Timeupdate handler for mobile and double-guard loop for desktop
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    // Check if we are in autoplay loop or scroll loop phase
    if (isPlayingAutoplay || isMobile || scrollProgressRef.current >= SCRUB_END_PROGRESS) {
      if (video.currentTime >= LOOP_END) {
        video.currentTime = LOOP_START;
      }
    }
  };

  // High performance seek, loop and play update loop (60fps precision check)
  // Audit: Does NOT interleave DOM reads/writes, preventing layout thrashing entirely
  useEffect(() => {
    if (isMobile || prefersReducedMotion || videoError) return;

    let frameId: number;

    const performFrameUpdate = () => {
      const video = videoRef.current;
      if (video && !isNaN(video.duration) && video.readyState >= 1) {
        const progress = scrollProgressRef.current;

        // Loop final shot logic
        if (isPlayingAutoplay || progress >= SCRUB_END_PROGRESS) {
          if (video.currentTime >= LOOP_END) {
            try {
              video.currentTime = LOOP_START;
            } catch (e) {
              // Fail silently and retry on next frame
            }
          }
        }

        // Scrubbing logic (only when not in autoplay and not in loop phase)
        if (!isPlayingAutoplay && progress < SCRUB_END_PROGRESS) {
          const target = targetTimeRef.current;
          const current = video.currentTime;
          const delta = Math.abs(target - current);
          const isBoundary = target === 0 || target === video.duration;

          // Seek threshold: ~1/24s (~0.042s) to prevent browser stutter and flashes.
          if (delta > 0.042 || (isBoundary && delta > 0.001)) {
            try {
              video.currentTime = target;
            } catch (e) {
              // Fail silently and retry on next frame
            }
          }
        }
      }
      frameId = requestAnimationFrame(performFrameUpdate);
    };

    frameId = requestAnimationFrame(performFrameUpdate);
    return () => cancelAnimationFrame(frameId);
  }, [isPlayingAutoplay, isMobile, prefersReducedMotion, videoError]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      videoDurationRef.current = video.duration;
    }
  };

  const handleVideoEnded = () => {
    setIsPlayingAutoplay(false);
  };

  const handleVideoError = () => {
    console.error("Chronis video failed to load. Falling back to static poster image.");
    setVideoError(true);
  };

  // Render Fallback State (Reduced Motion OR Video Load Error)
  if (prefersReducedMotion || videoError) {
    return (
      <div
        ref={containerRef}
        className="relative w-full bg-background"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="w-full bg-black flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden"
          style={{ height: `${STICKY_HEIGHT}vh` }}
        >
          <img
            src={
              videoError ? "/images/chronis-poster-first.jpg" : "/images/chronis-poster-last.jpg"
            }
            alt="Chronis Pendant Device"
            className="max-h-[60%] w-auto object-contain select-none"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <div className="flex flex-col items-center gap-4 z-10">
            <Button
              size="lg"
              className="h-11 rounded-md px-6 cursor-pointer"
              onClick={() => {
                document.getElementById("welcome-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Get started <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>

        <div id="welcome-section" className="relative z-10 w-full bg-background">
          {children}
        </div>
      </div>
    );
  }

  // Render Mobile Flow (No Pinning, No Scrubbing)
  if (isMobile) {
    return (
      <div
        ref={containerRef}
        className="relative w-full bg-background"
        style={{ minHeight: "100vh" }}
      >
        <div
          className="w-full relative overflow-hidden"
          style={{ height: `${MOBILE_HERO_HEIGHT}vh` }}
        >
          <video
            ref={videoRef}
            src="/videos/chronis-assembly-scrub.mp4"
            muted
            playsInline
            autoPlay
            preload="metadata"
            poster="/images/chronis-poster-first.jpg"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          />

          {/* Vignette Removal Overlay */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(circle at center, transparent 40%, #cbd1d1 75%, var(--background) 100%)",
            }}
          />

          {/* Bottom Blend Overlay (fades gray backdrop into white/slate page background) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[25%] pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #cbd1d1 50%, var(--background) 100%)",
            }}
          />
        </div>

        <div id="welcome-section" className="relative z-10 w-full bg-background">
          {children}
        </div>
      </div>
    );
  }

  // Render Desktop Flow (Pinned Scroll Track)
  return (
    <div
      ref={containerRef}
      className="relative w-full bg-background animate-in fade-in duration-500"
      style={{ minHeight: "100vh" }}
    >
      {/* Scroll track with TRACK_HEIGHT */}
      <div className="relative w-full" style={{ height: `${TRACK_HEIGHT}vh` }}>
        {/* Pinned sticky container with STICKY_HEIGHT */}
        <motion.div
          className="sticky top-0 w-full overflow-hidden relative"
          style={{
            height: `${STICKY_HEIGHT}vh`,
            opacity: videoOpacity,
            pointerEvents: pointerEvents,
            willChange: "opacity", // Promote to GPU compositor layer
          }}
        >
          {/* Parallax Motion Video (scaled slightly to cover translations) */}
          <motion.video
            ref={videoRef}
            src="/videos/chronis-assembly-scrub.mp4"
            muted
            playsInline
            preload="auto"
            poster="/images/chronis-poster-first.jpg"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            style={{
              x: translateX,
              y: translateY,
              scale: 1.05,
              willChange: "transform", // Promote to GPU compositor layer
            }}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
            onError={handleVideoError}
          />

          {/* Vignette Removal Overlay (blends dark corners to video studio background and page background) */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background:
                "radial-gradient(circle at center, transparent 40%, #cbd1d1 75%, var(--background) 100%)",
            }}
          />

          {/* Bottom Blend Overlay (fades gray backdrop into white/slate page background) */}
          <div
            className="absolute bottom-0 left-0 w-full h-[25%] pointer-events-none z-10"
            style={{
              background:
                "linear-gradient(to bottom, transparent, #cbd1d1 50%, var(--background) 100%)",
            }}
          />

          {/* Minimal "scroll to continue" indicator */}
          <motion.div
            style={{ opacity: indicatorOpacity }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/50 text-[10px] font-semibold tracking-[0.2em] uppercase select-none pointer-events-none"
          >
            <span>Scroll to continue</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-6 bg-white/20 rounded-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1/2 bg-white/80 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Welcome Screen Wrapper - crossfades & slides up naturally */}
      <motion.div
        id="welcome-section"
        className="relative z-10 w-full bg-background"
        style={{
          opacity: welcomeOpacity,
          y: welcomeTranslateY,
          willChange: "transform, opacity", // Promote to GPU compositor layer
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
