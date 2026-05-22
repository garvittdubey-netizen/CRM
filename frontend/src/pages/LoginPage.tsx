import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Copy, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const DEMO_EMAIL = 'demo@builderone.com';
const DEMO_PASSWORD = 'demo@builderone.com';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
    });
  };

  const fillDemo = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="flex min-h-screen" data-testid="login-page">
      {/* Left: Login Form */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 lg:px-16 bg-background relative">
        {/* Back to landing */}
        <Link
          to="/"
          className="absolute top-6 left-6 lg:left-16 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-testid="back-to-landing"
        >
          <ArrowLeft size={14} />
          Back to home
        </Link>

        {/* Logo */}
        <div className="flex items-center mb-10" data-testid="login-logo">
          <div className="inline-flex items-center justify-center rounded-xl bg-slate-900 ring-1 ring-slate-800/60 px-4 h-14 shadow-sm">
            <img
              src="/builderone-logo-cropped.png"
              alt="BuilderOne CRM"
              className="h-9 w-auto object-contain"
              draggable={false}
            />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-semibold tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground">Sign in to your BuilderOne CRM workspace</p>
          </div>

          {/* Demo Credentials Card */}
          <div
            data-testid="demo-credentials-card"
            className="mb-6 rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50/50 p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-heading font-semibold text-slate-900">Demo Credentials</p>
                <p className="text-xs text-amber-800/80">Try BuilderOne CRM instantly</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 bg-white/70 rounded-md px-3 py-2 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">Email</p>
                  <p className="text-sm font-mono text-slate-900 truncate" data-testid="demo-email">
                    {DEMO_EMAIL}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_EMAIL, 'email')}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-amber-100 text-amber-700 transition-colors shrink-0"
                  data-testid="copy-demo-email"
                  aria-label="Copy email"
                >
                  {copiedField === 'email' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 bg-white/70 rounded-md px-3 py-2 border border-amber-100">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">Password</p>
                  <p className="text-sm font-mono text-slate-900 truncate" data-testid="demo-password">
                    {DEMO_PASSWORD}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_PASSWORD, 'password')}
                  className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-amber-100 text-amber-700 transition-colors shrink-0"
                  data-testid="copy-demo-password"
                  aria-label="Copy password"
                >
                  {copiedField === 'password' ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 w-full text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors py-1.5 px-2 rounded-md hover:bg-amber-100/60"
              data-testid="use-demo-credentials"
            >
              Use demo credentials →
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            {/* Error message */}
            {error && (
              <div
                data-testid="login-error"
                className="flex items-start gap-2.5 p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="login-submit-button"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <div className="mt-8 text-center text-xs text-muted-foreground space-y-1" data-testid="login-footer">
            <p className="font-medium">BuilderOne CRM &copy; 2026</p>
            <p>A product by MICROTECHNIQUE IT</p>
          </div>
        </div>
      </div>

      {/* Right: Property Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?crop=entropy&cs=srgb&fm=jpg&q=85&w=1400"
          alt="Modern luxury real estate property"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-navy-500/80 flex flex-col justify-end p-12">
          <div className="max-w-sm">
            <p className="text-2xl font-heading font-medium text-white leading-relaxed mb-4">
              "Smart CRM for builders &amp; real estate teams — built to close faster."
            </p>
            <p className="text-amber-300/90 text-sm font-medium tracking-wide uppercase">
              BuilderOne CRM — Build. Manage. Grow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
