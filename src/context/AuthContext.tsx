import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInAnonymously 
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCredentials: (emailOrUser: string, pass: string, assignedRole?: UserRole) => Promise<boolean>;
  loginAsRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  canEdit: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_ACCOUNTS: Record<string, { role: UserRole; name: string }> = {
  'admin@terminal.id': { role: 'superadmin', name: 'Capt. Hendra Wijaya (Terminal Manager)' },
  'supervisor@terminal.id': { role: 'supervisor', name: 'Bambang Pratama (Yard Supervisor)' },
  'gate@terminal.id': { role: 'gate_operator', name: 'Rian Setyadi (Gate Inspector)' },
  'agent@terminal.id': { role: 'agent', name: 'Siti Rahma (Shipping Line Agent)' },
  'admin': { role: 'superadmin', name: 'Capt. Hendra Wijaya (Terminal Manager)' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('tos_user_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userRole: UserRole = currentUser.email === 'arizo4212@gmail.com' ? 'superadmin' : 'supervisor';
        const newProf: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email || 'operator@terminal.id',
          displayName: currentUser.displayName || 'Petugas Terminal',
          role: userRole,
          avatar: currentUser.photoURL || undefined,
          terminalCode: 'TPK-JAKARTA-01'
        };
        setProfile(newProf);
        localStorage.setItem('tos_user_profile', JSON.stringify(newProf));
      }
      setLoading(false);
    });

    // Check if we already have local session
    const saved = localStorage.getItem('tos_user_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
    setLoading(false);

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const isUserAdmin = res.user.email === 'arizo4212@gmail.com';
      const prof: UserProfile = {
        uid: res.user.uid,
        email: res.user.email || 'user@terminal.id',
        displayName: res.user.displayName || 'Google Terminal User',
        role: isUserAdmin ? 'superadmin' : 'supervisor',
        avatar: res.user.photoURL || undefined,
        terminalCode: 'TPK-JAKARTA-01'
      };
      setProfile(prof);
      localStorage.setItem('tos_user_profile', JSON.stringify(prof));
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      throw err;
    }
  };

  const loginWithCredentials = async (emailOrUser: string, pass: string, assignedRole?: UserRole): Promise<boolean> => {
    if (!emailOrUser.trim() || !pass.trim()) {
      throw new Error('Username/Email dan Password wajib diisi.');
    }

    try {
      // Try anonymous auth if enabled on backend, but do not fail if restricted
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        // Ignored gracefully so login continues with operator session
      }

      const match = PRESET_ACCOUNTS[emailOrUser.toLowerCase().trim()];
      const determinedRole = assignedRole || (match ? match.role : 'supervisor');
      const determinedName = match ? match.name : `Operator (${emailOrUser})`;

      const prof: UserProfile = {
        uid: auth.currentUser?.uid || `uid-opt-${Date.now()}`,
        email: emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@terminal.id`,
        displayName: determinedName,
        role: determinedRole,
        terminalCode: 'TPK-JAKARTA-01'
      };

      setProfile(prof);
      localStorage.setItem('tos_user_profile', JSON.stringify(prof));
      return true;
    } catch (err) {
      console.error('Login credentials error:', err);
      throw err;
    }
  };

  const loginAsRole = async (role: UserRole) => {
    try {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch (err) {
        // Ignored gracefully
      }

      const roleNames: Record<UserRole, string> = {
        superadmin: 'Capt. Hendra Wijaya (Terminal Manager)',
        supervisor: 'Bambang Pratama (Yard Supervisor)',
        gate_operator: 'Rian Setyadi (Gate Inspector)',
        agent: 'Siti Rahma (Shipping Line Agent)'
      };

      const prof: UserProfile = {
        uid: auth.currentUser?.uid || `uid-${role}-${Date.now()}`,
        email: `${role}@terminal.id`,
        displayName: roleNames[role],
        role,
        terminalCode: 'TPK-JAKARTA-01'
      };

      setProfile(prof);
      localStorage.setItem('tos_user_profile', JSON.stringify(prof));
    } catch (err) {
      console.error('Quick role login error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem('tos_user_profile');
  };

  const isAdmin = profile?.role === 'superadmin';
  const canEdit = profile?.role === 'superadmin' || profile?.role === 'supervisor' || profile?.role === 'gate_operator';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      loginWithGoogle,
      loginWithCredentials,
      loginAsRole,
      logout,
      canEdit,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
