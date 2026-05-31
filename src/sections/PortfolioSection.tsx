import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { StarIcon } from '@/components/Icons';
import { Button } from '@/components/ui/button';
import { useRef, useState, useEffect } from 'react';
import Hls from 'hls.js';

const MUX_PLAYBACK_ID = 'u9S01csa601lvI9bTAh7UFqoCCYkYoDrHJOG1v02NYmk8k';
const HLS_URL = `https://stream.mux.com/${MUX_PLAYBACK_ID}.m3u8`;

interface PortfolioSectionProps {
  onBookClick: () => void;
}

export function PortfolioSection({ onBookClick }: PortfolioSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  // HLS setup + autoplay
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    let hls: Hls | null = null;

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked — retry on first user interaction
        const retry = () => {
          video.play().catch(() => {});
          document.removeEventListener('touchstart', retry);
          document.removeEventListener('click', retry);
        };
        document.addEventListener('touchstart', retry, { once: true });
        document.addEventListener('click', retry, { once: true });
      });
    };

    if (Hls.isSupported()) {
      // Chrome, Firefox, Edge — use hls.js
      hls = new Hls({ autoStartLoad: true });
      hls.loadSource(HLS_URL);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        tryPlay();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Safari — native HLS support
      video.src = HLS_URL;
      video.addEventListener('canplay', tryPlay, { once: true });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, []);

  const images = [
    "/images/nailsscientizt1.jpg",
    "/images/nailsscientizt2.jpg",
    "/images/nailsscientizt4.jpg",
    "/images/499012921_1237947281282372_2557799189293767274_n.jpg",
  ];

  return (
    <section id="portfolio" className="relative w-full overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* ===== BACKGROUND VIDEO ===== */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* First frame as poster — shows instantly before video loads */}
        <img
          src={`https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?time=0&width=1920`}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Video — fades in once loaded */}
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="auto"
          poster={`https://image.mux.com/${MUX_PLAYBACK_ID}/thumbnail.jpg?time=0&width=1920`}
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-obsidian/60 backdrop-blur-[1px]" />
      </div>

      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-neon-pink/20 rounded-full blur-[120px] pointer-events-none z-[1]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-pink-light/10 rounded-full blur-[150px] pointer-events-none z-[1]" />

      <div className="container mx-auto px-6 mb-8 flex flex-col items-center text-center relative z-30">
        <div className="glass-panel p-8 md:p-12 mb-12 max-w-4xl relative overflow-hidden shimmer-shine">
          {/* subtle shine inside the card */}
          <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[-20deg] animate-[float_8s_infinite_linear]" />
          
          <h2 className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-lab-white to-metallic-silver text-4xl md:text-5xl lg:text-7xl uppercase mb-4 drop-shadow-md">
            Get Your Nails Done
          </h2>
          <p className="font-heading text-lab-white/80 text-lg md:text-xl font-light">
            Manchester based nail tech · Book your set below 💅
          </p>
        </div>

        <StarIcon
          className="text-neon-pink hidden md:block w-16 h-16 mt-8 animate-[spin_10s_linear_infinite] absolute right-8 top-8 opacity-40 drop-shadow-[0_0_15px_rgba(255,0,127,0.5)]"
        />
      </div>

      <div className="embla w-full pl-6 md:pl-8 lg:pl-16 relative z-20 cursor-grab active:cursor-grabbing" ref={emblaRef}>
        <div className="embla__container flex">
          {images.map((src, index) => (
            <div className="embla__slide flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_35%] lg:flex-[0_0_28%] pr-4 md:pr-6" key={index}>
              <div className="glass-card overflow-hidden h-full p-2 hover-lift">
                <img
                  src={src}
                  alt={`Nail Scientizt Portfolio ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg transition-transform duration-500 hover:scale-[1.03]"
                  style={{ aspectRatio: '4/5' }}
                  loading={index < 3 ? "eager" : "lazy"}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full flex justify-center mt-8 gap-4 px-6 relative z-30">
        <button
          onClick={() => emblaApi?.scrollPrev()}
          className="w-12 h-12 rounded-full border border-metallic-silver/40 text-lab-white flex items-center justify-center hover:bg-white/10 hover:border-lab-white transition-all backdrop-blur-sm"
          aria-label="Previous image"
        >
          ←
        </button>
        <button
          onClick={() => emblaApi?.scrollNext()}
          className="w-12 h-12 rounded-full border border-metallic-silver/40 text-lab-white flex items-center justify-center hover:bg-white/10 hover:border-lab-white transition-all backdrop-blur-sm"
          aria-label="Next image"
        >
          →
        </button>
      </div>

      <div className="relative z-30 container mx-auto px-6 mt-16 flex justify-center">
        <Button
          onClick={onBookClick}
          size="lg"
          className="btn-primary text-xl px-12 py-8 animate-pulse-glow press-feedback"
        >
          Book Now
        </Button>
      </div>
    </section>
  );
}
