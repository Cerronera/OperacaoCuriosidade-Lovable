import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  nome: string;
  role: string;
  email: string;
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, role, email')
          .eq('id', session.user.id)
          .maybeSingle();
        if (error) {
          console.error('Error fetching user profile:', error);
          setProfile(null);
        } else {
          setProfile(data);
        }
      } else {
        setProfile(null);
        if (window.location.pathname !== '/') {
            navigate('/');
      }
    }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return { user, profile, loading };
}