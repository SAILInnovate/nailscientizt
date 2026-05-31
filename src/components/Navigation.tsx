import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

interface NavigationProps {
  onBookClick: () => void;
}

export function Navigation({ onBookClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMenuOpen(false);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 border-b border-transparent ${isScrolled
          ? 'bg-obsidian/80 backdrop-blur-xl border-metallic-silver/20 py-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
          : 'bg-transparent py-6'
          }`}
      >
        <div className="w-full px-6 lg:px-12 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => scrollToSection('hero')}
            className="group flex flex-col items-start transition-transform duration-300 hover:scale-[1.02]"
          >
            <img
              src="/images/thenailscientizt.png"
              alt="The Nail Scientizt Logo"
              className="h-12 md:h-16 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,0,127,0.3)]"
            />
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('portfolio')}
              className="font-heading font-semibold text-sm uppercase tracking-wider text-lab-white/70 hover:text-neon-pink transition-all hover:scale-105"
            >
              My Work
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="font-heading font-semibold text-sm uppercase tracking-wider text-lab-white/70 hover:text-neon-pink transition-all hover:scale-105"
            >
              Prices
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="font-heading font-semibold text-sm uppercase tracking-wider text-lab-white/70 hover:text-neon-pink transition-all hover:scale-105"
            >
              Reviews
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="font-heading font-semibold text-sm uppercase tracking-wider text-lab-white/70 hover:text-neon-pink transition-all hover:scale-105"
            >
              Contact
            </button>
            <button
              onClick={onBookClick}
              className="btn-primary text-sm px-6 py-2.5 rounded-full animate-pulse-glow press-feedback"
            >
              Book Now
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-lab-white p-2"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-obsidian/95 backdrop-blur-xl transition-transform duration-300 md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          <button
            onClick={() => scrollToSection('portfolio')}
            className="font-display text-4xl text-lab-white hover:text-neon-pink transition-colors"
          >
            My Work
          </button>
          <button
            onClick={() => scrollToSection('services')}
            className="font-display text-4xl text-lab-white hover:text-neon-pink transition-colors"
          >
            Prices
          </button>
          <button
            onClick={() => scrollToSection('testimonials')}
            className="font-display text-4xl text-lab-white hover:text-neon-pink transition-colors"
          >
            Reviews
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="font-display text-4xl text-lab-white hover:text-neon-pink transition-colors"
          >
            Contact
          </button>
          <button
            onClick={() => {
              setIsMenuOpen(false);
              onBookClick();
            }}
            className="mt-8 btn-primary text-xl px-10 py-4 animate-pulse-glow press-feedback"
          >
            Book Now
          </button>
        </div>
      </div>
    </>
  );
}
