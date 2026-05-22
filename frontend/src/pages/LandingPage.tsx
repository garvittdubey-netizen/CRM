import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Building,
  UserCheck,
  Workflow,
  BarChart3,
  Users2,
  Bell,
  FileText,
  CalendarClock,
  Zap,
  Shield,
  TrendingUp,
  Radio,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const WHATSAPP_NUMBER = '916355997080';
const WHATSAPP_MSG = 'Hey, I am interested in BuilderOne CRM';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
const THEME_KEY = 'landing:theme';

/** Official WhatsApp brand mark. Filled (green-on-white phone) is used everywhere
 *  the brand color should dominate (floating button). The outlined variant lets
 *  it sit inline with the surrounding button color. */
function WhatsAppIcon({ size = 18, className = '', variant = 'brand' }: { size?: number; className?: string; variant?: 'brand' | 'inherit' }) {
  if (variant === 'brand') {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path
          fill="#25D366"
          d="M16.003 0C7.166 0 .003 7.163.003 16c0 2.823.738 5.474 2.03 7.778L0 32l8.444-2.213A15.94 15.94 0 0 0 16.003 32C24.84 32 32 24.836 32 16S24.84 0 16.003 0Z"
        />
        <path
          fill="#FFFFFF"
          d="M16.003 29.333c-2.504 0-4.83-.682-6.834-1.864l-.49-.293-5.012 1.314 1.34-4.882-.32-.503A13.262 13.262 0 0 1 2.67 16c0-7.355 5.978-13.333 13.333-13.333S29.336 8.645 29.336 16c0 7.354-5.978 13.333-13.333 13.333Zm7.31-9.985c-.401-.2-2.37-1.17-2.737-1.304-.367-.134-.634-.2-.9.2-.268.4-1.033 1.303-1.267 1.57-.234.267-.467.3-.868.1-.4-.2-1.692-.624-3.225-1.989-1.192-1.062-1.998-2.375-2.232-2.775-.234-.4-.025-.616.176-.815.18-.18.4-.467.6-.7.2-.234.267-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.9-2.166-1.234-2.966-.325-.78-.654-.674-.9-.687a16.71 16.71 0 0 0-.768-.014c-.267 0-.7.1-1.067.5-.367.4-1.4 1.366-1.4 3.333 0 1.967 1.434 3.866 1.633 4.133.2.267 2.82 4.31 6.834 6.046.954.412 1.7.658 2.28.842.957.305 1.829.262 2.518.16.768-.115 2.37-.967 2.703-1.9.334-.933.334-1.733.234-1.9-.1-.167-.367-.267-.768-.467Z"
        />
      </svg>
    );
  }
  // Inherit color (currentColor) — for use inline with text-colored buttons
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M27.2 4.65A15.92 15.92 0 0 0 16.003 0C7.166 0 .003 7.163.003 16c0 2.823.738 5.474 2.03 7.778L0 32l8.444-2.213A15.94 15.94 0 0 0 16.003 32C24.84 32 32 24.836 32 16a15.92 15.92 0 0 0-4.8-11.35Zm-11.197 24.7c-2.504 0-4.83-.683-6.834-1.864l-.49-.294-5.012 1.314 1.34-4.881-.32-.504A13.26 13.26 0 0 1 2.67 16c0-7.355 5.978-13.333 13.333-13.333S29.336 8.645 29.336 16c0 7.354-5.978 13.349-13.333 13.349Zm7.31-9.985c-.401-.2-2.37-1.17-2.737-1.303-.367-.134-.634-.2-.9.2-.268.4-1.033 1.303-1.267 1.57-.234.267-.467.3-.868.1-.4-.2-1.692-.624-3.225-1.99-1.192-1.061-1.998-2.374-2.232-2.774-.234-.4-.025-.616.175-.815.181-.18.4-.467.6-.7.2-.234.268-.4.4-.667.134-.267.067-.5-.033-.7-.1-.2-.9-2.167-1.233-2.966-.326-.78-.655-.674-.9-.687a16.71 16.71 0 0 0-.768-.014c-.267 0-.7.1-1.067.5s-1.4 1.366-1.4 3.333c0 1.967 1.434 3.866 1.633 4.133.2.267 2.82 4.31 6.834 6.046.954.413 1.7.658 2.281.842.957.305 1.828.262 2.517.16.768-.115 2.37-.967 2.703-1.9.334-.933.334-1.733.234-1.9-.1-.167-.367-.267-.767-.467Z" />
    </svg>
  );
}

const FEATURES = [
  { icon: Users, title: 'Lead Management', desc: 'Capture, qualify, and route every inbound lead with zero leakage.' },
  { icon: Building, title: 'Property Management', desc: 'A single source of truth for inventory, pricing, and availability.' },
  { icon: UserCheck, title: 'Client Management', desc: 'Unified client profiles with full history and preferences.' },
  { icon: Workflow, title: 'Deal Pipeline', desc: 'Drag-and-drop kanban from negotiation to closure.' },
  { icon: () => <WhatsAppIcon size={18} variant="inherit" className="text-[#25D366]" />, title: 'WhatsApp Integration', desc: 'Talk to leads on the channel they actually reply on.' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time KPIs across teams, funnels, and revenue.' },
  { icon: Users2, title: 'Team Management', desc: 'Roles, territories, and ownership without the chaos.' },
  { icon: CalendarClock, title: 'Follow-ups', desc: 'Smart reminders so no opportunity goes cold.' },
  { icon: FileText, title: 'Reports', desc: 'Print-ready PDFs and CSV exports for stakeholders.' },
  { icon: Bell, title: 'Notifications', desc: 'Real-time alerts that surface what actually matters.' },
];

const WORKFLOW_STEPS = [
  { title: 'Capture Lead', desc: 'Every inquiry, one inbox.' },
  { title: 'Assign Agent', desc: 'Auto-route by territory or skill.' },
  { title: 'Property Match', desc: 'AI-style matching by budget & preference.' },
  { title: 'Client Follow-up', desc: 'Cadenced touchpoints, never missed.' },
  { title: 'Deal Pipeline', desc: 'Move stages, log every change.' },
  { title: 'Close Deal', desc: 'Documentation to payment, tracked.' },
  { title: 'Analytics & Reports', desc: 'Learn, improve, repeat.' },
];

const WHY_REASONS = [
  { icon: Zap, title: 'Faster conversions', desc: 'Cut your sales cycle by routing the right lead to the right agent — instantly.', accent: 'from-amber-400 to-yellow-500' },
  { icon: Users2, title: 'Better team management', desc: 'See exactly who is working what, with role-aware visibility and ownership.', accent: 'from-blue-400 to-indigo-500' },
  { icon: Shield, title: 'Centralized CRM', desc: 'Properties, leads, clients, deals — all interconnected in one platform.', accent: 'from-emerald-400 to-teal-500' },
  { icon: Radio, title: 'WhatsApp automation', desc: 'Native two-way WhatsApp with templates, image sharing, and audit trails.', accent: 'from-green-400 to-emerald-500' },
  { icon: TrendingUp, title: 'Real-time analytics', desc: 'Pipeline health, agent performance, revenue — live, not next week.', accent: 'from-fuchsia-400 to-pink-500' },
];

/**
 * Logo chip — wraps the BuilderOne logo in a dark navy backdrop so the
 * gold + white logo stays readable on BOTH light and dark page themes
 * (the original PNG was authored against a black canvas).
 */
function LogoChip({ size = 'md', testId }: { size?: 'sm' | 'md' | 'lg'; testId?: string }) {
  const heights = { sm: 'h-9', md: 'h-11', lg: 'h-14' };
  const inner = { sm: 'h-6', md: 'h-7', lg: 'h-9' };
  return (
    <div
      className={`inline-flex items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-800/60 dark:ring-amber-500/20 px-3 ${heights[size]} shadow-sm`}
      data-testid={testId}
    >
      <img
        src="/builderone-logo-cropped.png"
        alt="BuilderOne CRM"
        className={`${inner[size]} w-auto object-contain`}
        draggable={false}
      />
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Local theme state for the landing page (independent from the CRM theme).
  // Persisted to localStorage so the choice survives refresh.
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem(THEME_KEY);
    if (stored === 'dark') return true;
    if (stored === 'light') return false;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    document.title = 'BuilderOne CRM — Smart CRM for Builders & Real Estate Teams';
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
    } catch {
      /* ignored — quota / disabled storage */
    }
  }, [dark]);

  const handleExplore = () => navigate(user ? '/dashboard' : '/login');

  return (
    <div className={dark ? 'dark' : ''}>
    <div
      className={`min-h-screen bg-white text-slate-900 dark:bg-black dark:text-slate-100 antialiased overflow-x-hidden transition-colors duration-300 relative`}
      data-testid="landing-page"
      data-theme={dark ? 'dark' : 'light'}
    >
      {/* Premium dark-mode ambient gold glows (page-level, fixed) */}
      {dark && (
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full bg-amber-500/[0.05] blur-[160px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-amber-400/[0.04] blur-[180px]" />
        </div>
      )}
      {/* ============ NAV ============ */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-black/60 border-b border-slate-200/60 dark:border-amber-500/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" data-testid="landing-nav-logo">
            <LogoChip size="sm" testId="nav-logo-chip" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-amber-300 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 dark:hover:text-amber-300 transition-colors">Workflow</a>
            <a href="#why" className="hover:text-slate-900 dark:hover:text-amber-300 transition-colors">Why us</a>
            <a href="#about" className="hover:text-slate-900 dark:hover:text-amber-300 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              type="button"
              onClick={() => setDark((v) => !v)}
              aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-slate-200 dark:border-amber-500/20 text-slate-600 dark:text-amber-300 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition-colors"
              data-testid="theme-toggle-button"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors px-3 py-2 rounded-md"
              data-testid="nav-whatsapp-link"
            >
              <WhatsAppIcon size={16} variant="brand" />
              WhatsApp
            </a>
            <Button
              onClick={handleExplore}
              className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-600 dark:hover:from-amber-300 dark:hover:to-amber-500 text-white dark:text-black font-semibold dark:shadow-[0_0_20px_rgba(245,158,11,0.35)] shadow-sm"
              data-testid="nav-explore-button"
            >
              Explore CRM
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative z-10 pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Decorative grid bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '64px 64px',
              color: dark ? '#f8fafc' : '#0f172a',
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full opacity-30 dark:opacity-20 blur-3xl bg-gradient-to-br from-amber-200 via-blue-100 to-transparent dark:from-amber-500/30 dark:via-indigo-500/20 dark:to-transparent" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 dark:opacity-15 blur-3xl bg-gradient-to-tr from-indigo-200 to-transparent dark:from-fuchsia-500/30 dark:to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-400/40 bg-amber-50/80 dark:bg-amber-500/[0.08] dark:backdrop-blur-sm text-amber-800 dark:text-amber-300 text-xs font-semibold tracking-wide dark:shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <Sparkles size={12} />
                BUILT FOR BUILDERS &amp; REAL ESTATE TEAMS
              </div>

              <h1
                className="font-heading font-semibold tracking-tight text-5xl lg:text-7xl leading-[1.05] text-slate-900 dark:text-white"
                data-testid="hero-headline"
              >
                Smart CRM for{' '}
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-yellow-600 bg-clip-text text-transparent dark:drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                  Builders
                </span>{' '}
                &amp; Real&nbsp;Estate Teams
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                BuilderOne CRM unifies lead capture, property inventory, client journeys, and
                deal pipelines — so your team closes faster with zero spreadsheets and zero leakage.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleExplore}
                  size="lg"
                  className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-600 dark:hover:from-amber-300 dark:hover:to-amber-500 text-white dark:text-black font-semibold shadow-lg shadow-[hsl(214,52%,24%)]/20 dark:shadow-[0_0_40px_rgba(245,158,11,0.4)] h-12 px-6 text-base"
                  data-testid="hero-explore-button"
                >
                  Explore BuilderOne CRM
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:bg-transparent dark:border-emerald-500/60 w-full sm:w-auto"
                    data-testid="hero-whatsapp-button"
                  >
                    <WhatsAppIcon size={18} variant="brand" className="mr-2" />
                    Contact on WhatsApp
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  Setup in minutes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  WhatsApp ready
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in" data-testid="hero-visual">
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-amber-100/60 via-blue-100/40 to-indigo-100/60 dark:from-amber-500/30 dark:via-yellow-500/10 dark:to-amber-700/20 blur-2xl" />
              <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[hsl(214,52%,18%)] dark:from-[#0c0a08] dark:via-[#1a1410] dark:to-[#0c0a08] dark:ring-1 dark:ring-amber-500/20 p-8 lg:p-10 shadow-2xl dark:shadow-[0_25px_80px_-15px_rgba(245,158,11,0.25)] border border-slate-800/50">
                <img
                  src="/builderone-logo-cropped.png"
                  alt="BuilderOne CRM"
                  className="w-full max-w-md mx-auto"
                  draggable={false}
                />
                <p className="text-center text-amber-300/90 font-semibold tracking-[0.3em] text-xs mt-4 uppercase">
                  Build · Manage · Grow
                </p>
                {/* Floating stat cards */}
                <div className="grid grid-cols-3 gap-3 mt-10">
                  {[
                    { n: '12k+', l: 'Leads handled' },
                    { n: '3.2×', l: 'Faster closures' },
                    { n: '99.9%', l: 'Uptime' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl bg-white/5 dark:bg-amber-500/[0.04] border border-white/10 dark:border-amber-500/20 p-3 text-center backdrop-blur">
                      <div className="text-2xl font-heading font-semibold text-amber-300">{s.n}</div>
                      <div className="text-[10px] tracking-wider text-slate-400 uppercase mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center mt-24 text-slate-400 dark:text-slate-600 animate-bounce">
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="relative z-10 py-24 lg:py-32 bg-slate-50/60 dark:bg-transparent border-y border-slate-200/60 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-3 uppercase">— Features</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900 dark:text-white">
              Everything your real-estate team needs, in one workspace.
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-5 leading-relaxed">
              A complete CRM built ground-up for builders and brokerages — not a generic SaaS hand-me-down.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="features-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  data-testid={`feature-card-${f.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group relative rounded-2xl border border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a] p-6 hover:border-[hsl(214,52%,24%)]/30 dark:hover:border-amber-400/40 hover:shadow-xl dark:hover:shadow-[0_8px_40px_-10px_rgba(245,158,11,0.25)] hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-11 w-11 rounded-xl bg-[hsl(214,52%,24%)]/5 dark:bg-gradient-to-br dark:from-amber-500/15 dark:to-amber-700/5 border border-[hsl(214,52%,24%)]/10 dark:border-amber-500/30 flex items-center justify-center mb-5 group-hover:bg-[hsl(214,52%,24%)] dark:group-hover:bg-gradient-to-br dark:group-hover:from-amber-400 dark:group-hover:to-amber-600 group-hover:border-[hsl(214,52%,24%)] dark:group-hover:border-amber-400 transition-all">
                    <Icon
                      size={18}
                      className="text-[hsl(214,52%,24%)] dark:text-amber-300 group-hover:text-white dark:group-hover:text-black transition-colors"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-900 dark:text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section id="workflow" className="relative z-10 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-3 uppercase">— How it works</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900 dark:text-white">
              One continuous workflow.<br />
              <span className="text-slate-500 dark:text-slate-400">From inquiry to closure.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Animated connecting line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-300 dark:via-amber-500/60 to-transparent" />

            <div className="space-y-6 lg:space-y-0" data-testid="workflow-steps">
              {WORKFLOW_STEPS.map((step, i) => (
                <div
                  key={step.title}
                  data-testid={`workflow-step-${i}`}
                  className={`lg:grid lg:grid-cols-2 lg:gap-12 items-center ${
                    i % 2 === 0 ? '' : 'lg:[&>*:first-child]:order-2'
                  }`}
                >
                  <div className={`lg:p-8 ${i % 2 === 0 ? 'lg:text-right' : ''}`}>
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(214,52%,24%)] to-[hsl(214,52%,35%)] dark:from-amber-300 dark:via-amber-500 dark:to-yellow-700 text-amber-300 dark:text-black font-heading font-semibold text-lg shadow-lg dark:shadow-[0_0_30px_rgba(245,158,11,0.5)] mb-3">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-heading font-semibold text-slate-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                  </div>
                  <div className="hidden lg:flex justify-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-100 dark:ring-amber-500/20 dark:shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY BUILDERONE ============ */}
      <section id="why" className="relative z-10 py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-black dark:to-black border-y border-slate-200/60 dark:border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 dark:text-amber-400 mb-3 uppercase">— Why BuilderOne</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900 dark:text-white">
              Built for real-estate reality.<br />
              <span className="text-slate-500 dark:text-slate-500">Not generic SaaS.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="why-grid">
            {WHY_REASONS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  data-testid={`why-card-${i}`}
                  className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/[0.06] p-7 hover:shadow-2xl dark:hover:shadow-[0_8px_50px_-10px_rgba(245,158,11,0.3)] dark:hover:border-amber-400/30 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${r.accent} opacity-10 dark:opacity-30 blur-2xl`} />
                  <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center mb-5 shadow-md dark:shadow-lg dark:shadow-amber-500/10`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-slate-900 dark:text-white mb-2">{r.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT PRODUCT ============ */}
      <section id="about" className="relative z-10 py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(214,52%,15%)] to-slate-900 dark:from-[#0c0a08] dark:via-[#1a1410] dark:to-[#0c0a08] p-10 lg:p-16 text-white overflow-hidden shadow-2xl dark:shadow-[0_25px_80px_-15px_rgba(245,158,11,0.2)] border border-slate-800/50 dark:border-amber-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 dark:bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 dark:bg-yellow-500/10 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-amber-400 dark:text-amber-300 mb-3 uppercase">— About the product</p>
                <h2 className="text-3xl lg:text-4xl font-heading font-semibold tracking-tight mb-5">
                  BuilderOne CRM is a product by{' '}
                  <span className="text-amber-300 dark:text-amber-300 dark:drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">MICROTECHNIQUE IT</span>
                </h2>
                <p className="text-slate-300 leading-relaxed mb-6">
                  MITCS is an IT services company building enterprise-grade products for the
                  construction, real-estate, and PropTech industries. BuilderOne CRM is our
                  flagship platform — engineered with the rigor of mission-critical systems and
                  the polish of consumer software.
                </p>
                <a
                  href="https://microtechniqueit.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 font-medium transition-colors"
                  data-testid="mitcs-website-link"
                >
                  Visit microtechniqueit.com
                  <ArrowRight size={14} />
                </a>
              </div>

              <div className="flex flex-col items-center justify-center" data-testid="mitcs-logo-block">
                <div className="rounded-2xl bg-white/95 border border-white/10 dark:border-amber-500/20 p-8 backdrop-blur-sm shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)]">
                  <img
                    src="/mitcs-logo.png"
                    alt="MICROTECHNIQUE IT"
                    className="h-40 w-auto"
                    draggable={false}
                  />
                </div>
                <p className="mt-5 font-heading font-semibold text-lg tracking-wide text-purple-200">MICROTECHNIQUE IT</p>
                <p className="text-amber-300/70 text-xs tracking-[0.3em] uppercase">MITCS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative z-10 py-24 lg:py-32 bg-slate-50/60 dark:bg-transparent border-t border-slate-200/60 dark:border-white/[0.06] overflow-hidden">
        {/* dark-mode gold glow behind CTA */}
        <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-amber-500/[0.08] blur-3xl pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-6xl font-heading font-semibold tracking-tight text-slate-900 dark:text-white leading-[1.05]">
            Ready to grow your{' '}
            <span className="bg-gradient-to-r from-amber-500 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-yellow-600 bg-clip-text text-transparent dark:drop-shadow-[0_0_30px_rgba(245,158,11,0.4)]">
              real-estate business?
            </span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-6 max-w-xl mx-auto">
            Join builders and brokerages already running their entire pipeline on BuilderOne CRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Button
              onClick={handleExplore}
              size="lg"
              className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] dark:bg-gradient-to-r dark:from-amber-400 dark:to-amber-600 dark:hover:from-amber-300 dark:hover:to-amber-500 text-white dark:text-black font-semibold shadow-lg dark:shadow-[0_0_40px_rgba(245,158,11,0.4)] h-12 px-8 text-base"
              data-testid="cta-explore-button"
            >
              Explore CRM
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 dark:bg-transparent dark:border-emerald-500/60 w-full sm:w-auto"
                data-testid="cta-whatsapp-button"
              >
                <WhatsAppIcon size={18} variant="brand" className="mr-2" />
                Contact on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 bg-slate-900 dark:bg-black text-slate-400 py-12 border-t border-slate-800 dark:border-white/[0.06]">
        {/* Thin gold accent line above footer (dark mode only) */}
        <div className="hidden dark:block absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <LogoChip size="sm" />
            </div>
            <div className="text-center lg:text-right text-sm">
              <p className="text-slate-300 dark:text-amber-100/90 font-medium" data-testid="footer-copy">
                BuilderOne CRM © 2026
              </p>
              <p className="text-slate-500 text-xs mt-1">
                A product by{' '}
                <a
                  href="https://microtechniqueit.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400/80 hover:text-amber-400 transition-colors"
                >
                  MICROTECHNIQUE IT
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* ============ FLOATING WHATSAPP ============ */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
        data-testid="floating-whatsapp-button"
        aria-label="Contact on WhatsApp"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-60" />
          <div className="relative h-14 w-14 rounded-full bg-white shadow-xl shadow-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <WhatsAppIcon size={36} variant="brand" />
          </div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden group-hover:block whitespace-nowrap bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg">
            Chat with us on WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900 dark:border-l-white" />
          </div>
        </div>
      </a>
    </div>
    </div>
  );
}
