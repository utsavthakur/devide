import React, { useState, useEffect, useRef } from 'react';
import Button from './Button';
import { ChevronRight, Github, Laptop } from 'lucide-react';
import NeuralBackground from './ui/flow-field-background';

interface HeroProps {
  onStartCoding?: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStartCoding }) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const video1Ref = useRef<HTMLVideoElement>(null);
  const video2Ref = useRef<HTMLVideoElement>(null);

  const videos = ['/b02.mp4', '/b03.mp4'];

  useEffect(() => {
    const video1 = video1Ref.current;
    const video2 = video2Ref.current;

    if (!video1 || !video2) return;

    // Start with first video
    video1.play().catch(err => console.log('Video autoplay failed:', err));

    const handleVideoEnd = (videoElement: HTMLVideoElement, nextIndex: number) => {
      setIsTransitioning(true);

      // Start next video
      const nextVideo = nextIndex === 0 ? video1 : video2;
      nextVideo.currentTime = 0;
      nextVideo.play().catch(err => console.log('Video play failed:', err));

      // Fade transition
      setTimeout(() => {
        setCurrentVideo(nextIndex);
        setIsTransitioning(false);
      }, 500);
    };

    const onVideo1End = () => handleVideoEnd(video1, 1);
    const onVideo2End = () => handleVideoEnd(video2, 0);

    video1.addEventListener('ended', onVideo1End);
    video2.addEventListener('ended', onVideo2End);

    return () => {
      video1.removeEventListener('ended', onVideo1End);
      video2.removeEventListener('ended', onVideo2End);
    };
  }, []);

  return (
    <div className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Alternating Video Background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
        {/* VIDEOS TEMPORARILY DISABLED - Using Neural Background Only */}
        {/* Video 1 (b02.mp4) */}
        {/* <video
          ref={video1Ref}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 0 ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <source src={videos[0]} type="video/mp4" />
        </video> */}

        {/* Video 2 (b03.mp4) */}
        {/* <video
          ref={video2Ref}
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentVideo === 1 ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <source src={videos[1]} type="video/mp4" />
        </video> */}

        {/* Dark overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/90 backdrop-blur-[2px]"></div>

        {/* Neural Flow Field Layer */}
        <div className="absolute inset-0 z-[2] opacity-80">
          <NeuralBackground
            color="#ef4444" // Red-500 to match theme
            trailOpacity={0.08}
            particleCount={400}
            speed={0.3} // Slower, more elegant movement
          />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Badge: Updated to Red theme */}
          <div className="animate-fade-in-up flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/30 border border-red-900/50 backdrop-blur-md mb-8 hover:bg-red-900/40 transition-colors cursor-pointer group">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-sm font-medium text-red-100 group-hover:text-white transition-colors">Codexia v2.0 is now live</span>
            <ChevronRight className="w-4 h-4 text-red-400 group-hover:text-white transition-colors" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-purple-100 to-zinc-400 max-w-5xl">
            Development environment <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-purple-600">reimagined for the web</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed">
            Spin up full-stack dev environments in seconds. Collaborate in real-time.
            Deploy with one click. No setup required.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
            <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 group" onClick={onStartCoding}>
              Start Coding for Free
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto gap-2">
              <Github className="w-5 h-5" />
              Star on GitHub
            </Button>
          </div>

          <div className="flex items-center gap-8 text-zinc-500 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Laptop className="w-4 h-4" /> Works on any device
            </span>
            <span className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full bg-zinc-800 border-2 border-black" />
                ))}
              </div>
              Used by 50,000+ devs
            </span>
          </div>

        </div>
      </div>

      {/* Background Gradients: Injected Red/Rose hues - now layered over video */}
      <div className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-[5]">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px]" />
        {/* Changed from fuchsia to rose/red */}
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-red-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light z-[6]"></div>
    </div>
  );
};

export default Hero;