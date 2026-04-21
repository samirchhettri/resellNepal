import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  error: null,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          // Check admin status
          let isAdmin = false;
          try {
            const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
            if (adminDoc.exists()) {
              isAdmin = true;
            } else if (currentUser.email === 'samir.s4m112@gmail.com') {
              // Bootstrap admin
              await setDoc(doc(db, 'admins', currentUser.uid), {
                email: currentUser.email,
                addedAt: serverTimestamp()
              });
              isAdmin = true;
            }
          } catch (e: any) {
            console.warn("Could not verify admin status", e);
            // If the error is permission denied, it just means they aren't an admin yet or bootstrapping failed
            // We shouldn't let this block the entire login process
            if (e.code === 'permission-denied') {
               console.log("Admin check: Permission denied (User is likely not an admin)");
            }
          }

          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              displayName: currentUser.displayName || 'Anonymous Student',
              photoURL: currentUser.photoURL || undefined,
              role: isAdmin ? 'admin' : 'student',
              createdAt: serverTimestamp(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          } else {
            const data = userDoc.data() as UserProfile;
            setProfile({ ...data, role: isAdmin ? 'admin' : 'student' });
          }
        } catch (err: any) {
          console.error("Auth error:", err);
          setError(err.message);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
