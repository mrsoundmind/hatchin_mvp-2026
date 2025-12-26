import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is signed in
    const savedUser = localStorage.getItem('hatchin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = (userData: User) => {
    setUser(userData);
    localStorage.setItem('hatchin_user', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('hatchin_user');
    localStorage.removeItem('hasCompletedOnboarding');
    // Reload to reset the app state
    window.location.reload();
  };

  const hasCompletedOnboarding = () => {
    return localStorage.getItem('hasCompletedOnboarding') === 'true';
  };

  const completeOnboarding = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
  };

  return {
    user,
    isLoading,
    signIn,
    signOut,
    hasCompletedOnboarding,
    completeOnboarding,
    isSignedIn: !!user
  };
}
