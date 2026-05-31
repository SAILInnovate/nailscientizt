import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { InstagramIcon, MapPinIcon, ClockIcon } from '@/components/Icons';

gsap.registerPlugin(ScrollTrigger);

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const content = contentRef.current;
    const footer = footerRef.current;

    if (!section || !content) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        content,
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: content,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      if (footer) {
        gsap.fromTo(
          footer,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 95%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative bg-soft-pink py-20 md:py-32 z-[100]"
    >
      <div className="w-full px-6 lg:px-12">
        <div className="max-w-xl mx-auto flex flex-col items-center text-center">
          <div ref={contentRef}>
            <h2 className="heading-lg text-obsidian mb-6">
              LET'S TALK
            </h2>
            <p className="body-text text-obsidian/80 mb-8 max-w-sm mx-auto">
              Questions? Want to check availability? Send a DM on Instagram and I'll get back to you within 24 hours.
            </p>

            <div className="space-y-4 flex flex-col items-center justify-center">
              <a
                href="https://instagram.com/thenailscientizt"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 text-obsidian hover:text-obsidian/70 transition-all hover:scale-105"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
                <span className="font-display font-bold">@thenailscientizt</span>
              </a>

              <div className="flex items-center justify-center gap-3 text-obsidian">
                <MapPinIcon size={20} />
                <span className="font-display font-bold">Openshaw, Manchester · M11</span>
              </div>

              <div className="flex items-center justify-center gap-3 text-obsidian">
                <ClockIcon size={20} />
                <span className="font-display font-bold">Replies within 24 hours</span>
              </div>
            </div>

            {/* Logo */}
            <div className="mt-12 flex justify-center">
              <img
                src="/images/thenailscientizt.png"
                alt="The Nail Scientizt Logo"
                className="w-32 h-auto opacity-80"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          ref={footerRef}
          className="mt-16 pt-8 border-t-2 border-obsidian/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <a href="/admin" className="text-sm text-obsidian/60 text-center md:text-left hover:text-obsidian/60 no-underline cursor-default">
              © {new Date().getFullYear()} The Nail Scientizt. All rights reserved.
            </a>
            <div className="flex gap-6 justify-center md:justify-start">
              <a
                href="https://instagram.com/thenailscientizt"
                target="_blank"
                rel="noopener noreferrer"
                className="text-obsidian/60 hover:text-obsidian transition-all hover:scale-110"
                aria-label="Instagram"
              >
                <InstagramIcon size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
