import { type ReactNode, useEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowUpRight, Check, Menu, Minus, Plus, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const services = [
  { number: '01', title: 'Abuse Trauma', text: 'Trauma such as sexual abuse and domestic violence can impact one’s spirituality,...' },
  { number: '02', title: 'Concierge Therapy', text: 'Modeled after the Medical Doctor (MD) Concierge, we offer therapy via the...' },
  { number: '03', title: 'Addictions', text: 'We live in a time when addictions are more common than ever. From smartphones,...' },
  { number: '04', title: 'Couples Therapy', text: 'Therapy will be tailored to each unique couple’s needs. Upon meeting each couple,...' },
  { number: '05', title: 'Intervention', text: 'Need an intervention…call Belina. By now we all have heard about interventions,...' },
  { number: '06', title: 'DUI Program', text: 'If you are a high profile man, such as an attorney, doctor, newscaster, reporter,...' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = '', delay = '' }: { children: ReactNode; className?: string; delay?: string }) {
  const ref = useReveal();
  return <div ref={ref} className={`reveal ${delay} ${className}`}>{children}</div>;
}

function ConsultationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [sent, setSent] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#0a1b27]/80 px-5 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="consultation-title">
      <div className="relative max-h-[90dvh] w-full max-w-[580px] overflow-y-auto bg-[#f5f1e7] p-7 text-[#102b3b] shadow-2xl sm:p-11">
        <button type="button" onClick={onClose} aria-label="Close consultation form" data-testid="button-close-consultation" className="absolute right-5 top-5 p-2 text-[#527076] transition-colors hover:text-[#102b3b]">
          <X size={20} strokeWidth={1.5} />
        </button>
        {!sent ? (
          <>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[#527076]">Begin privately</p>
            <h2 id="consultation-title" className="mt-4 font-display text-4xl leading-[.95] sm:text-5xl">A first conversation<br /><em>without pressure.</em></h2>
            <p className="mt-5 max-w-md text-sm leading-6 text-[#527076]">Leave a few details and Belina will be in touch to arrange a confidential consultation.</p>
            <form className="mt-8 space-y-5" onSubmit={(event) => { event.preventDefault(); setSent(true); }}>
              <div>
                <label htmlFor="name" className="mb-2 block font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#527076]">Your name</label>
                <input id="name" required data-testid="input-consultation-name" className="w-full border-b border-[#adc0bb] bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[#94aaa5] focus:border-[#1e6565]" placeholder="First and last name" />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#527076]">Email address</label>
                <input id="email" type="email" required data-testid="input-consultation-email" className="w-full border-b border-[#adc0bb] bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[#94aaa5] focus:border-[#1e6565]" placeholder="you@example.com" />
              </div>
              <div>
                <label htmlFor="reason" className="mb-2 block font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#527076]">What brings you here?</label>
                <textarea id="reason" rows={3} data-testid="input-consultation-reason" className="w-full resize-none border-b border-[#adc0bb] bg-transparent px-0 py-3 text-base outline-none transition-colors placeholder:text-[#94aaa5] focus:border-[#1e6565]" placeholder="A few words is enough." />
              </div>
              <button type="submit" data-testid="button-submit-consultation" className="mt-2 flex w-full items-center justify-center gap-3 bg-[#1e6565] px-5 py-4 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#f5f1e7] transition-colors hover:bg-[#102b3b]">
                Request a consultation <ArrowUpRight size={15} />
              </button>
            </form>
          </>
        ) : (
          <div className="py-14 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#1e6565] text-[#1e6565]"><Check size={20} strokeWidth={1.5} /></div>
            <h2 className="mt-7 font-display text-4xl">Thank you for reaching out.</h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#527076]">Your note is ready to be received. Belina will follow up with care and discretion.</p>
            <button type="button" onClick={onClose} data-testid="button-finish-consultation" className="mt-8 border-b border-[#1e6565] pb-1 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#1e6565]">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Home() {
  const [modalOpen, setModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openService, setOpenService] = useState<number | null>(null);
  const openConsultation = () => { setModalOpen(true); setMenuOpen(false); };
  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="grain min-h-[100dvh] overflow-hidden bg-[#f5f1e7] text-[#102b3b]">
      <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/15 bg-[#102b3b]/95 text-[#f5f1e7] shadow-[0_6px_24px_rgba(5,20,29,.12)] backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between px-6 py-5 lg:px-12">
          <a href="#top" onClick={closeMenu} data-testid="link-brand" className="group flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center border border-[#c6a86a] text-[#c6a86a] font-display text-xl italic">Y</span>
            <span className="hidden text-[11px] font-semibold uppercase tracking-[.2em] sm:block">Your Way to<br />Recovery</span>
          </a>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[74px] flex-col gap-5 bg-[#102b3b] px-6 py-7 lg:static lg:flex lg:flex-row lg:items-center lg:gap-8 lg:bg-transparent lg:p-0`} aria-label="Main navigation">
            <a href="#approach" onClick={closeMenu} data-testid="link-nav-approach" className="font-mono-ui text-[10px] uppercase tracking-[.17em] text-[#d5e0dc] transition-colors hover:text-[#d4b779]">Our approach</a>
            <a href="#services" onClick={closeMenu} data-testid="link-nav-services" className="font-mono-ui text-[10px] uppercase tracking-[.17em] text-[#d5e0dc] transition-colors hover:text-[#d4b779]">Areas of support</a>
            <a href="#belina" onClick={closeMenu} data-testid="link-nav-belina" className="font-mono-ui text-[10px] uppercase tracking-[.17em] text-[#d5e0dc] transition-colors hover:text-[#d4b779]">About Belina</a>
            <button type="button" onClick={openConsultation} data-testid="button-nav-consultation" className="mt-1 flex w-fit items-center gap-3 border border-[#d4b779] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-[.17em] text-[#f5f1e7] transition-colors hover:bg-[#d4b779] hover:text-[#102b3b] lg:mt-0">
              Begin a conversation <ArrowUpRight size={14} />
            </button>
          </nav>
          <button type="button" onClick={() => setMenuOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={menuOpen} data-testid="button-toggle-menu" className="p-2 lg:hidden">
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      <main id="top">
        <section className="relative grid overflow-hidden bg-[#102b3b] text-[#f5f1e7] lg:min-h-[100svh] lg:grid-cols-[58%_42%]">
          <div className="relative h-[62dvh] min-h-[460px] image-tint lg:h-[100svh]">
            <img src="/images/hero-man.jpg" alt="A man looking out through a window toward a misty horizon" className="h-full w-full object-cover object-[68%_66%] opacity-80" />
          </div>
          <div className="relative flex min-h-[500px] flex-col justify-center px-6 py-16 lg:min-h-[100svh] lg:px-14 lg:py-0 xl:px-20">
            <div className="max-w-[670px]">
              <Reveal>
                <p className="font-mono-ui text-[10px] uppercase tracking-[.24em] text-[#d4b779]">Private therapy &amp; recovery practice for men</p>
              </Reveal>
              <Reveal delay="delay-1">
                <h1 className="mt-7 font-display text-[clamp(4.25rem,9vw,8.4rem)] leading-[.82] tracking-[-.04em]">Your Way<br /><em>to Recovery</em></h1>
              </Reveal>
              <Reveal delay="delay-2">
                <div className="mt-9 flex max-w-[440px] items-start gap-4 border-l border-[#d4b779] pl-5 text-sm leading-6 text-[#d5e0dc]">
                  <span>Therapy unique to you.<br />Honoring men’s inherent strengths<br />and personal growth.</span>
                </div>
              </Reveal>
              <Reveal delay="delay-3">
                <button type="button" onClick={openConsultation} data-testid="button-hero-consultation" className="mt-9 flex items-center gap-5 border border-[#d4b779] px-5 py-4 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#f5f1e7] transition-all hover:bg-[#d4b779] hover:text-[#102b3b]">
                  Find your next step <ArrowDown size={15} />
                </button>
              </Reveal>
            </div>
            <div className="absolute bottom-10 right-12 hidden items-center gap-3 text-[#d5e0dc] lg:flex">
              <span className="font-mono-ui text-[9px] uppercase tracking-[.2em]">Scroll to explore</span><ArrowDown size={14} />
            </div>
          </div>
        </section>

        <section className="border-b border-[#c5d0c9] bg-[#dbe5df]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-x divide-[#b9c9c1] lg:grid-cols-3">
            {[
              ['Private by design'], ['Telehealth available'], ['Built around you'],
            ].map(([label]) => (
              <div key={label} className="flex items-center px-6 py-5 lg:px-12">
                <span className="text-xs text-[#365660]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="approach" className="relative bg-[#f5f1e7] px-6 py-24 lg:px-12 lg:py-36">
          <div className="mx-auto grid max-w-[1120px] gap-16 lg:grid-cols-[.75fr_1.25fr] lg:gap-28">
            <Reveal className="lg:pt-4">
              <p className="font-mono-ui text-[14px] font-semibold uppercase tracking-[.14em] text-[#527076] sm:text-[16px]">Convenience &amp; Quality</p>
              <div className="mt-9 h-px w-16 bg-[#c6a86a]" />
              <p className="mt-8 max-w-[270px] text-sm leading-6 text-[#527076]">One learning aspect to the Covid 19 Pandemic was that telehealth is just as effective as in person therapy in a brick and mortar office.</p>
            </Reveal>
            <Reveal delay="delay-1">
              <h2 className="max-w-[700px] font-display text-[clamp(3rem,6vw,6.4rem)] leading-[.9] tracking-[-.035em]">Therapy unique<br /><em>to you.</em></h2>
              <p className="mt-9 max-w-[600px] text-base leading-7 text-[#527076]">Social distancing did not mean that one could not access quality mental health care, but just the opposite. Whether you work long hours or live in a rural area and/or busy balancing children, these are all reasons to meet via a video platform such as Zoom or Google Meets.</p>
              <a href="#concierge" data-testid="link-approach-concierge" className="mt-9 inline-flex items-center gap-3 border-b border-[#1e6565] pb-2 font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#1e6565] transition-colors hover:border-[#c6a86a] hover:text-[#8b6e37]">See how we work <ArrowUpRight size={14} /></a>
            </Reveal>
          </div>
        </section>

        <section id="concierge" className="bg-[#1e6565] px-6 py-24 text-[#f5f1e7] lg:px-12 lg:py-32">
          <div className="mx-auto grid max-w-[1120px] gap-16 lg:grid-cols-[.82fr_1.18fr] lg:items-end lg:gap-28">
            <Reveal>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#d4b779]">A different level of care</p>
              <h2 className="mt-7 font-display text-[clamp(3rem,5.6vw,6rem)] leading-[.88] tracking-[-.03em]">Life Coaching,<br /><em>Concierge Recovery Therapy</em></h2>
            </Reveal>
            <Reveal delay="delay-1">
              <p className="max-w-[560px] text-base leading-7 text-[#d5e0dc]">Modeled after the Medical Doctor (MD) Concierge, we offer therapy via the Concierge Therapist. For a monthly fee, you or your loved one will receive private therapy.</p>
              <div className="mt-10 grid gap-5 border-t border-[#6a9993] pt-7 sm:grid-cols-2">
                <div><span className="font-mono-ui text-[10px] text-[#d4b779]">01 / CONSISTENCY</span><p className="mt-2 text-sm leading-6 text-[#d5e0dc]">A dependable rhythm that makes change possible between sessions, not just inside them.</p></div>
                <div><span className="font-mono-ui text-[10px] text-[#d4b779]">02 / ACCESS</span><p className="mt-2 text-sm leading-6 text-[#d5e0dc]">Telehealth via Zoom or Google Meets, designed around the realities of your life.</p></div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="services" className="bg-[#dbe5df] px-6 py-24 lg:px-12 lg:py-32">
          <div className="mx-auto max-w-[1120px]">
            <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#527076]">Where we can meet you</p>
                <h2 className="mt-6 font-display text-[clamp(3.25rem,6vw,6.5rem)] leading-[.86] tracking-[-.035em]">Areas of<br /><em>support.</em></h2>
              </div>
              <p className="max-w-[280px] text-sm leading-6 text-[#527076]">The label is never the whole story. Start where it feels most useful.</p>
            </Reveal>
            <div className="mt-16 border-t border-[#aabeb5]">
              {services.map((service, index) => {
                const isOpen = openService === index;
                return (
                  <div key={service.number} className="border-b border-[#aabeb5]">
                    <button type="button" onClick={() => setOpenService(isOpen ? null : index)} aria-expanded={isOpen} data-testid={`button-service-${service.number}`} className="flex w-full items-center gap-5 py-6 text-left transition-colors hover:text-[#1e6565] lg:py-7">
                      <span className="w-8 font-mono-ui text-[10px] text-[#8b6e37]">{service.number}</span>
                      <span className="font-display text-3xl sm:text-4xl">{service.title}</span>
                      <span className="ml-auto text-[#527076]">{isOpen ? <Minus size={18} strokeWidth={1.5} /> : <Plus size={18} strokeWidth={1.5} />}</span>
                    </button>
                    <div className={`grid transition-[grid-template-rows] duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p data-testid={`text-service-${service.number}`} className="mb-7 ml-[52px] max-w-[500px] text-sm leading-6 text-[#527076] sm:ml-[52px]">{service.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="belina" className="bg-[#f5f1e7] px-6 py-24 lg:px-12 lg:py-36">
          <div className="mx-auto grid max-w-[1120px] gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:gap-28">
            <Reveal className="relative">
              <div className="absolute -bottom-5 -right-5 z-10 flex h-24 w-24 flex-col justify-center bg-[#d4b779] px-4 text-[#102b3b]">
                <span className="font-mono-ui text-[9px] uppercase tracking-[.15em]">Practice</span><span className="mt-1 font-display text-2xl italic">with care</span>
              </div>
              <img src="/images/therapy-room.jpg" alt="A calm, private therapy room with a window onto muted green trees" className="aspect-[4/5] w-full object-cover grayscale-[.12]" />
            </Reveal>
            <Reveal delay="delay-1">
              <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#527076]">About Belina</p>
              <h2 className="mt-7 font-display text-[clamp(3rem,5vw,5.8rem)] leading-[.88] tracking-[-.03em]">About Belina<br /><em>N. Fruitman</em></h2>
              <p className="mt-9 max-w-[560px] text-base leading-7 text-[#527076]">Belina’s goal is to support her client’s in their personal and professional goals by integrating evidence based tools and diverse materials while focusing on the client’s inherent strengths.</p>
              <p className="mt-5 max-w-[560px] text-base leading-7 text-[#527076]">Belina N. Fruitman, LCSW, CAS, LLC</p>
              <div className="mt-10 flex items-center gap-4 border-t border-[#c5d0c9] pt-6">
                <span className="h-9 w-9 border border-[#1e6565] text-center font-display text-2xl italic leading-8 text-[#1e6565]">B</span>
                <span className="font-mono-ui text-[10px] uppercase tracking-[.16em] text-[#527076]">Belina · Your Way to Recovery</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="bg-[#102b3b] px-6 py-24 text-[#f5f1e7] lg:px-12 lg:py-32">
          <div className="mx-auto max-w-[1120px]">
            <Reveal>
              <div className="flex items-start justify-between gap-8">
                <div>
                  <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#d4b779]">Who we are</p>
                  <h2 className="mt-7 max-w-[650px] font-display text-[clamp(3rem,5.5vw,6rem)] leading-[.87] tracking-[-.03em]">Honoring men’s inherent<br /><em>strengths and personal growth.</em></h2>
                </div>
                <ArrowUpRight className="mt-1 hidden text-[#d4b779] sm:block" size={30} strokeWidth={1} />
              </div>
            </Reveal>
            <div className="mt-16 grid gap-0 border-t border-[#365461] lg:grid-cols-3 lg:divide-x lg:divide-[#365461]">
              {[
                ['01', 'Reach out', 'Tell us a little about what is happening and what you hope could be different.'],
                ['02', 'Make space', 'We arrange a private consultation and talk through the right shape of support.'],
                ['03', 'Move forward', 'Together, we make a plan that can hold up in your actual life.'],
              ].map(([number, title, text], index) => (
                <Reveal key={number} delay={`delay-${index + 1}`} className="border-b border-[#365461] py-7 lg:border-b-0 lg:px-8 lg:py-8 lg:first:pl-0">
                  <span className="font-mono-ui text-[10px] text-[#d4b779]">{number}</span>
                  <h3 className="mt-10 font-display text-3xl">{title}</h3>
                  <p className="mt-4 max-w-[260px] text-sm leading-6 text-[#a9c1bc]">{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#d4b779] px-6 py-24 text-[#102b3b] lg:px-12 lg:py-32">
          <div className="mx-auto flex max-w-[1120px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
            <Reveal>
              <p className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[#365660]">A quieter kind of progress</p>
              <h2 className="mt-7 max-w-[700px] font-display text-[clamp(3.3rem,6vw,6.8rem)] leading-[.85] tracking-[-.04em]">Coaching men through<br /><em>the process of recovery.</em></h2>
            </Reveal>
            <Reveal delay="delay-1" className="lg:pb-1">
              <button type="button" onClick={openConsultation} data-testid="button-final-consultation" className="flex items-center gap-4 border border-[#102b3b] px-5 py-4 font-mono-ui text-[10px] uppercase tracking-[.17em] transition-colors hover:bg-[#102b3b] hover:text-[#f5f1e7]">Arrange a consultation <ArrowUpRight size={15} /></button>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="bg-[#102b3b] px-6 py-12 text-[#d5e0dc] lg:px-12 lg:py-16">
        <div className="mx-auto grid max-w-[1320px] gap-12 lg:grid-cols-[1.3fr_.7fr_.7fr]">
          <div>
            <div className="flex items-center gap-3 text-[#f5f1e7]"><span className="flex h-9 w-9 items-center justify-center border border-[#c6a86a] font-display text-xl italic text-[#c6a86a]">Y</span><span className="text-[11px] font-semibold uppercase tracking-[.2em]">Your Way to<br />Recovery</span></div>
            <p className="mt-7 max-w-[320px] text-sm leading-6 text-[#9db4af]">A private therapy and recovery practice for men, built around your life.</p>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#d4b779]">Explore</p>
            <div className="mt-5 flex flex-col items-start gap-3 text-sm"><a href="#approach" data-testid="link-footer-approach" className="transition-colors hover:text-[#d4b779]">Our approach</a><a href="#services" data-testid="link-footer-services" className="transition-colors hover:text-[#d4b779]">Areas of support</a><a href="#belina" data-testid="link-footer-belina" className="transition-colors hover:text-[#d4b779]">About Belina</a></div>
          </div>
          <div>
            <p className="font-mono-ui text-[10px] uppercase tracking-[.18em] text-[#d4b779]">Connect</p>
            <button type="button" onClick={openConsultation} data-testid="button-footer-consultation" className="mt-5 border-b border-[#6a9993] pb-1 text-left text-sm transition-colors hover:border-[#d4b779] hover:text-[#d4b779]">Begin a private conversation <ArrowUpRight className="ml-1 inline" size={14} /></button>
            <p className="mt-5 text-xs text-[#9db4af]">Telehealth via Zoom or Google Meets</p>
          </div>
        </div>
        <div className="mx-auto mt-14 flex max-w-[1320px] flex-col justify-between gap-3 border-t border-[#365461] pt-5 font-mono-ui text-[9px] uppercase tracking-[.13em] text-[#718e8d] sm:flex-row"><span>© {new Date().getFullYear()} Your Way to Recovery</span><span>Private · Personal · Present</span></div>
      </footer>

      <ConsultationModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;