import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  Building,
  UserCheck,
  Workflow,
  MessageCircle,
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
  Phone,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const WHATSAPP_NUMBER = '916355997080';
const WHATSAPP_MSG =
  'Hey, I am interested in BuilderOne CRM';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

const FEATURES = [
  { icon: Users, title: 'Lead Management', desc: 'Capture, qualify, and route every inbound lead with zero leakage.' },
  { icon: Building, title: 'Property Management', desc: 'A single source of truth for inventory, pricing, and availability.' },
  { icon: UserCheck, title: 'Client Management', desc: 'Unified client profiles with full history and preferences.' },
  { icon: Workflow, title: 'Deal Pipeline', desc: 'Drag-and-drop kanban from negotiation to closure.' },
  { icon: MessageCircle, title: 'WhatsApp Integration', desc: 'Talk to leads on the channel they actually reply on.' },
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

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = 'BuilderOne CRM — Smart CRM for Builders & Real Estate Teams';
  }, []);

  const handleExplore = () => navigate(user ? '/dashboard' : '/login');

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden" data-testid="landing-page">
      {/* ============ NAV ============ */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3" data-testid="landing-nav-logo">
            <img
              src="/builderone-logo-cropped.png"
              alt="BuilderOne CRM"
              className="h-9 w-auto"
              draggable={false}
            />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition-colors">Workflow</a>
            <a href="#why" className="hover:text-slate-900 transition-colors">Why us</a>
            <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-2">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-md"
              data-testid="nav-whatsapp-link"
            >
              <Phone size={14} />
              WhatsApp
            </a>
            <Button
              onClick={handleExplore}
              className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] text-white shadow-sm"
              data-testid="nav-explore-button"
            >
              Explore CRM
              <ArrowRight size={14} className="ml-1.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ============ HERO ============ */}
      <section className="relative pt-32 pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Decorative grid bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] rounded-full opacity-30 blur-3xl bg-gradient-to-br from-amber-200 via-blue-100 to-transparent" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-20 blur-3xl bg-gradient-to-tr from-indigo-200 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50/80 text-amber-800 text-xs font-semibold tracking-wide">
                <Sparkles size={12} />
                BUILT FOR BUILDERS &amp; REAL ESTATE TEAMS
              </div>

              <h1
                className="font-heading font-semibold tracking-tight text-5xl lg:text-7xl leading-[1.05] text-slate-900"
                data-testid="hero-headline"
              >
                Smart CRM for{' '}
                <span className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 bg-clip-text text-transparent">
                  Builders
                </span>{' '}
                &amp; Real&nbsp;Estate Teams
              </h1>

              <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-xl">
                BuilderOne CRM unifies lead capture, property inventory, client journeys, and
                deal pipelines — so your team closes faster with zero spreadsheets and zero leakage.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={handleExplore}
                  size="lg"
                  className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] text-white shadow-lg shadow-[hsl(214,52%,24%)]/20 h-12 px-6 text-base"
                  data-testid="hero-explore-button"
                >
                  Explore BuilderOne CRM
                  <ArrowRight size={16} className="ml-2" />
                </Button>
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-base border-emerald-500 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto"
                    data-testid="hero-whatsapp-button"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Contact on WhatsApp
                  </Button>
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  Setup in minutes
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  WhatsApp ready
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative animate-fade-in" data-testid="hero-visual">
              <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-amber-100/60 via-blue-100/40 to-indigo-100/60 blur-2xl" />
              <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-[hsl(214,52%,18%)] p-8 lg:p-10 shadow-2xl border border-slate-800/50">
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
                    <div key={s.l} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center backdrop-blur">
                      <div className="text-2xl font-heading font-semibold text-amber-300">{s.n}</div>
                      <div className="text-[10px] tracking-wider text-slate-400 uppercase mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex justify-center mt-24 text-slate-400 animate-bounce">
            <ChevronDown size={24} />
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-24 lg:py-32 bg-slate-50/60 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 mb-3 uppercase">— Features</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900">
              Everything your real-estate team needs, in one workspace.
            </h2>
            <p className="text-lg text-slate-600 mt-5 leading-relaxed">
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
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 hover:border-[hsl(214,52%,24%)]/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="h-11 w-11 rounded-xl bg-[hsl(214,52%,24%)]/5 border border-[hsl(214,52%,24%)]/10 flex items-center justify-center mb-5 group-hover:bg-[hsl(214,52%,24%)] group-hover:border-[hsl(214,52%,24%)] transition-colors">
                    <Icon
                      size={18}
                      className="text-[hsl(214,52%,24%)] group-hover:text-white transition-colors"
                    />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-slate-900 mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ WORKFLOW ============ */}
      <section id="workflow" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 mb-3 uppercase">— How it works</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900">
              One continuous workflow.<br />
              <span className="text-slate-500">From inquiry to closure.</span>
            </h2>
          </div>

          <div className="relative">
            {/* Animated connecting line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-300 to-transparent" />

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
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-[hsl(214,52%,24%)] to-[hsl(214,52%,35%)] text-amber-300 font-heading font-semibold text-lg shadow-lg mb-3">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <h3 className="text-2xl lg:text-3xl font-heading font-semibold text-slate-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-slate-600">{step.desc}</p>
                  </div>
                  <div className="hidden lg:flex justify-center">
                    <div className="h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHY BUILDERONE ============ */}
      <section id="why" className="py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-16">
            <p className="text-xs font-bold tracking-[0.25em] text-amber-700 mb-3 uppercase">— Why BuilderOne</p>
            <h2 className="text-4xl lg:text-5xl font-heading font-semibold tracking-tight text-slate-900">
              Built for real-estate reality.<br />
              <span className="text-slate-500">Not generic SaaS.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="why-grid">
            {WHY_REASONS.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={r.title}
                  data-testid={`why-card-${i}`}
                  className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-7 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${r.accent} opacity-10 blur-2xl`} />
                  <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center mb-5 shadow-md`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-heading font-semibold text-xl text-slate-900 mb-2">{r.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ ABOUT PRODUCT ============ */}
      <section id="about" className="py-24 lg:py-32">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[hsl(214,52%,15%)] to-slate-900 p-10 lg:p-16 text-white overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs font-bold tracking-[0.25em] text-amber-400 mb-3 uppercase">— About the product</p>
                <h2 className="text-3xl lg:text-4xl font-heading font-semibold tracking-tight mb-5">
                  BuilderOne CRM is a product by{' '}
                  <span className="text-amber-300">MICROTECHNIQUE IT</span>
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
                <div className="rounded-2xl bg-white/5 border border-white/10 p-10 backdrop-blur-sm">
                  <img
                    src="/mitcs-logo.png"
                    alt="MICROTECHNIQUE IT"
                    className="h-32 w-auto"
                    draggable={false}
                  />
                </div>
                <p className="mt-5 font-heading font-semibold text-lg tracking-wide">MICROTECHNIQUE IT</p>
                <p className="text-amber-300/80 text-xs tracking-[0.3em] uppercase">MITCS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 lg:py-32 bg-slate-50/60 border-t border-slate-200/60">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl lg:text-6xl font-heading font-semibold tracking-tight text-slate-900 leading-[1.05]">
            Ready to grow your{' '}
            <span className="bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              real-estate business?
            </span>
          </h2>
          <p className="text-lg text-slate-600 mt-6 max-w-xl mx-auto">
            Join builders and brokerages already running their entire pipeline on BuilderOne CRM.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Button
              onClick={handleExplore}
              size="lg"
              className="bg-[hsl(214,52%,24%)] hover:bg-[hsl(214,52%,30%)] text-white shadow-lg h-12 px-8 text-base"
              data-testid="cta-explore-button"
            >
              Explore CRM
              <ArrowRight size={16} className="ml-2" />
            </Button>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-emerald-500 text-emerald-700 hover:bg-emerald-50 w-full sm:w-auto"
                data-testid="cta-whatsapp-button"
              >
                <MessageCircle size={16} className="mr-2" />
                Contact on WhatsApp
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/builderone-logo-cropped.png"
                alt="BuilderOne CRM"
                className="h-8 w-auto"
                draggable={false}
              />
            </div>
            <div className="text-center lg:text-right text-sm">
              <p className="text-slate-300 font-medium" data-testid="footer-copy">
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
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
          <div className="relative h-14 w-14 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-xl shadow-emerald-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MessageCircle size={24} className="text-white" />
          </div>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 hidden group-hover:block whitespace-nowrap bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-lg">
            Chat with us on WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900" />
          </div>
        </div>
      </a>
    </div>
  );
}
