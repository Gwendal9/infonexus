import { Session, User } from '@supabase/supabase-js';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { setUser as setSentryUser, clearUser as clearSentryUser } from '@/lib/sentry';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthError(message: string, context: 'signin' | 'signup'): string {
  const msg = message.toLowerCase();

  // Network / connectivity
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return 'Problème de connexion réseau. Vérifiez votre connexion internet et réessayez.';
  }

  // Rate limiting
  if (msg.includes('rate limit') || msg.includes('too many requests') || msg.includes('email rate limit')) {
    return 'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.';
  }

  if (context === 'signup') {
    if (msg.includes('already registered') || msg.includes('already been registered')) {
      return 'Cet email est déjà associé à un compte. Essayez de vous connecter.';
    }
    if (msg.includes('weak') || msg.includes('password')) {
      return 'Le mot de passe est trop faible. Utilisez au moins 6 caractères avec des lettres et des chiffres.';
    }
    if (msg.includes('invalid') && msg.includes('email')) {
      return "L'adresse email n'est pas valide.";
    }
    return 'Impossible de créer le compte. Vérifiez vos informations et réessayez.';
  }

  // Sign in errors
  if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
    return 'Email ou mot de passe incorrect. Vérifiez vos identifiants.';
  }
  if (msg.includes('email not confirmed')) {
    return "Votre email n'a pas encore été confirmé. Vérifiez votre boîte de réception.";
  }
  if (msg.includes('user not found')) {
    return 'Aucun compte trouvé avec cet email.';
  }

  return 'Une erreur est survenue. Veuillez réessayer.';
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Track user in Sentry
      if (session?.user) {
        setSentryUser(session.user.id, session.user.email);
      } else {
        clearSentryUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { error: new Error(mapAuthError(error.message, 'signup')) };
    }
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: new Error(mapAuthError(error.message, 'signin')) };
    }
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
