'use client';

import React, { useEffect, useRef, useState } from 'react';

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState('/hotel.mp4');

  useEffect(() => {
    const updateVideoSource = () => {
      const isMobile = window.innerWidth <= 768;
      const newSrc = isMobile ? '/hotel.mp4' : '/hotelDESKTOP.mp4';
      
      if (newSrc !== videoSrc) {
        setVideoSrc(newSrc);
      }
    };

    updateVideoSource();

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateVideoSource, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [videoSrc]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, [videoSrc]);

  return (
    <div className="video-background">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
    </div>
  );
};

