import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getServices } from '@/lib/supabase';
import type { Service } from '@/lib/supabase';
import { ClockIcon } from '@/components/Icons';
import * as Tabs from '@radix-ui/react-tabs';

gsap.registerPlugin(ScrollTrigger);

interface ServicesListSectionProps {
  onBookClick: (service?: string) => void;
}

export function ServicesListSection({ onBookClick }: ServicesListSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadServices() {
      const data = await getServices();
      setServices(data);
      
      const uniqueCats = Array.from(new Set(data.map((s) => s.category)));
      // Sort categories — handles both old DB names and new names
      const orderMap: Record<string, number> = {
        'Hands - Short': 0, 'Short Canvas': 0,
        'Hands - Medium': 1, 'Medium Canvas': 1,
        'Hands - Long': 2, 'Long Canvas': 2,
        'Toes': 3, 'Pedicures': 3,
        'Deals': 4, 'Combos': 4,
        'Add-ons': 5,
      };
      uniqueCats.sort((a, b) => {
        const indexA = orderMap[a] ?? 99;
        const indexB = orderMap[b] ?? 99;
        return indexA - indexB;
      });
      setCategories(uniqueCats);
    }
    loadServices();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const heading = headingRef.current;

    if (!section || !heading) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        heading,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heading,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-20 md:py-32 z-[70] overflow-hidden"
    >
      <div className="absolute inset-0 bg-obsidian z-[-2]"></div>
      <div className="absolute top-[20%] right-[-5%] w-[400px] h-[400px] bg-neon-pink/10 rounded-full blur-[100px] pointer-events-none z-[-1]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-pink-light/5 rounded-full blur-[150px] pointer-events-none z-[-1]" />

      <div className="w-full max-w-6xl mx-auto px-6 lg:px-12">
        {/* Heading */}
        <div ref={headingRef} className="mb-12 md:mb-16 text-center">
          <h2 className="heading-lg text-lab-white mb-4">
            Prices
          </h2>
          <p className="body-text text-lab-white/70 max-w-2xl mx-auto font-light">
            Pick your set and book below
          </p>
        </div>

        {/* Tabs for Categories */}
        {categories.length > 0 ? (
          <Tabs.Root defaultValue={categories[0]} className="w-full flex flex-col items-center">
            <Tabs.List className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 w-full">
              {categories.map((cat) => (
                <Tabs.Trigger
                  key={cat}
                  value={cat}
                  className="px-6 py-3 font-heading font-semibold text-sm md:text-base uppercase tracking-wider rounded-full border border-metallic-silver/30 text-lab-white/70 data-[state=active]:bg-neon-pink data-[state=active]:text-lab-white data-[state=active]:border-neon-pink data-[state=active]:shadow-[0_0_15px_rgba(255,0,127,0.4)] transition-all hover:bg-white/5"
                >
                  {cat}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {categories.map((cat) => (
              <Tabs.Content key={cat} value={cat} className="w-full outline-none animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
                  {services
                    .filter((s) => s.category === cat)
                    .filter((s, i, arr) => arr.findIndex(x => x.name === s.name) === i)
                    .map((service) => (
                      <div
                        key={service.id}
                        className="glass-card p-6 md:p-8 flex flex-col hover-lift"
                      >
                        <h3 className="font-display font-bold text-2xl uppercase text-lab-white mb-3">
                          {service.name}
                        </h3>
                        <p className="text-lab-white/60 text-sm md:text-base mb-6 font-light flex-grow">
                          {service.description}
                        </p>

                        <div className="flex items-center gap-4 mb-6">
                          <div className="flex items-center gap-2 text-neon-pink">
                            <ClockIcon size={18} />
                            <span className="text-sm font-medium">{service.duration}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-auto">
                          <div>
                            <p className="font-display font-bold text-3xl text-lab-white">
                              £{service.price_from}
                            </p>
                          </div>
                          <button
                            onClick={() => onBookClick(service.name)}
                            className="bg-neon-pink text-lab-white font-heading font-semibold uppercase text-xs px-6 py-3 rounded-full hover:bg-neon-pink-light shadow-[0_0_10px_rgba(255,0,127,0.3)] transition-all press-feedback"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </Tabs.Content>
            ))}
          </Tabs.Root>
        ) : (
          <div className="text-center py-20 text-lab-white/50 animate-pulse">
            Loading services...
          </div>
        )}

        {/* Additional Info Card */}
        <div
          className="mt-16 glass-card p-8 md:p-12 relative overflow-hidden text-center max-w-4xl mx-auto border-neon-pink/30"
        >
           <div className="absolute top-0 right-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-[20deg] animate-[float_6s_infinite_linear]" />
           
          <h3 className="font-display font-bold text-2xl md:text-3xl uppercase text-lab-white mb-4">
            Not Sure What To Get?
          </h3>
          <p className="text-lab-white/70 text-lg mb-8 font-light max-w-xl mx-auto">
            Send me a pic of what you want on Instagram and I'll let you know the price
          </p>
          <a
            href="https://instagram.com/thenailscientizt"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-block"
          >
            DM Me
          </a>
        </div>
      </div>
    </section>
  );
}
