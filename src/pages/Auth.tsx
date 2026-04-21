import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithRedirect, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { ShieldCheck, LogIn } from 'lucide-react';

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      navigate('/profile');
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass p-8 rounded-3xl shadow-2xl"
      >
        <div className="w-16 h-16 bg-[#2dd4bf] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20">
          <ShieldCheck className="text-slate-900" size={32} />
        </div>
        <h1 className="text-2xl font-black text-white mb-2 tracking-tight">Welcome to resellNepal</h1>
        <p className="text-white/50 mb-8 leading-relaxed text-sm">
          The safest way to buy and sell second-hand items within the student community.
        </p>

        {error && (
          <div className="bg-red-500/20 text-red-200 border border-red-500/30 p-3 rounded-xl mb-4 text-xs font-bold uppercase tracking-wider">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center space-x-3 bg-white/5 border border-white/10 py-4 px-6 rounded-2xl font-bold text-white hover:bg-white/10 active:scale-95 transition-all mb-4"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          <span className="text-sm">Continue with Student ID</span>
        </button>

        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
          Secured by Student Community Trust
        </p>
      </motion.div>
    </div>
  );
}
