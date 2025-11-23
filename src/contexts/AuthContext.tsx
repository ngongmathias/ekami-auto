import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { syncUserProfile } from '../lib/userProfile';

interface AuthContextType {
  user: any;
  isLoaded: boolean;
  isSignedIn: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  // Sync user profile to Supabase when user signs in
  useEffect(() => {
    if (isSignedIn && user) {
      syncUserProfile(user).catch(error => {
        console.error('Failed to sync user profile:', error);
      });
    }
  }, [isSignedIn, user]);

  return (
    <AuthContext.Provider value={{ user, isLoaded, isSignedIn, signOut }}>
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
