import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp, loading } = useAuth();
  const { toast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const redirect = searchParams.get('redirect') || '/';

  useEffect(() => {
    if (!user || loading) return;
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()
      .then(({ data }) => {
        navigate(data ? '/admin' : redirect, { replace: true });
      });
  }, [user, loading, navigate, redirect]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const emailResult = emailSchema.safeParse(formData.email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(formData.password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    if (error) {
      const description = error.message.includes('already registered')
        ? 'This email is already registered. Please sign in instead.'
        : error.message;
      toast({ title: 'Error', description, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome to Nail Shingaar!', description: 'Your account has been created.' });
    }
  };

  const handleSignIn = async () => {
    const { error } = await signIn(formData.email, formData.password);
    if (error) {
      const description = error.message.includes('Invalid login credentials')
        ? 'Please check your email and password.'
        : error.message;
      toast({ title: 'Sign in failed', description, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back!', description: 'You have been signed in successfully.' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const pageTitle = isSignUp ? 'Create Account' : 'Welcome Back';
  const pageSubtitle = isSignUp
    ? 'Join us and discover beautiful nails'
    : 'Sign in to your account';
  let submitLabel = isSignUp ? 'Create Account' : 'Sign In';
  if (submitting) submitLabel = 'Please wait...';
  const togglePrompt = isSignUp ? 'Already have an account?' : "Don't have an account?";
  const toggleLabel = isSignUp ? 'Sign In' : 'Sign Up';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="font-script text-3xl text-gradient animate-pulse">Nail Shingaar</div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isSignUp ? 'Create Account' : 'Sign In'} | Nail Shingaar by Reet</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-rose-gold-light rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-champagne-light rounded-full blur-3xl opacity-40" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <Link to="/" className="block text-center mb-8">
            <span className="font-display text-3xl font-semibold text-gradient">Nail Shingaar</span>
            <span className="block font-script text-xl text-muted-foreground -mt-1">by Reet</span>
          </Link>

          <div className="p-8 rounded-3xl bg-card/90 backdrop-blur-lg shadow-card border border-border">
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-semibold">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground mt-2">{pageSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Your name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="rounded-xl"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="hello@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`rounded-xl ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`rounded-xl pr-10 ${errors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full shadow-soft hover:shadow-glow transition-shadow"
                size="lg"
              >
                {submitLabel}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {togglePrompt}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary font-semibold hover:underline"
                >
                  {toggleLabel}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
