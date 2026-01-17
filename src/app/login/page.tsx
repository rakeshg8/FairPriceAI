'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
      <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.3 64.5C308.6 102.3 280.9 92 248 92c-73.8 0-134.3 60.3-134.3 134.3s60.5 134.3 134.3 134.3c86.2 0 115.7-64.1 120.2-92.2H248v-66h239.3c1.3 7.8 2.7 15.6 2.7 23.8z"></path>
    </svg>
  );

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Sparkles className="mx-auto h-12 w-12 text-primary" />
                <h1 className="mt-4 text-3xl font-bold font-headline text-foreground">
                    Welcome to FairPrice AI
                </h1>
                <p className="mt-2 text-muted-foreground">
                    Sign in to get AI-powered fair price estimates.
                </p>
            </div>
            
            <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
                <Button 
                    onClick={login} 
                    disabled={loading} 
                    className="w-full"
                    variant="outline"
                >
                    {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GoogleIcon />
                    )}
                    Sign in with Google
                </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
                Powered by Firebase and Genkit.
            </p>
        </div>
    </div>
  );
}
