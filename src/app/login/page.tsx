'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' 
// MUDANÇA: Removido o ícone KeyRound que não é mais necessário
import { User, Lock, Eye, EyeOff, LoaderCircle, Mail } from 'lucide-react' 
import { createClient } from '@/lib/supabase/client'

// --- ÍCONES DE MARCAS ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
);

export default function LoginPage() {
  const [view, setView] = useState('login'); 
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  const handleViewChange = (newView) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError(null);
    setMessage(null);
  };

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (view === 'signup') {
      const isAdminSignUp = email === 'paulokakoma19@gmail.com' && password === '998800';
      const userRole = isAdminSignUp ? 'admin' : 'vendedor_anunciante';

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: isAdminSignUp ? 'Admin' : firstName,
            last_name: isAdminSignUp ? 'User' : lastName,
            full_name: isAdminSignUp ? 'Admin User' : `${firstName} ${lastName}`,
            role: userRole,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // MUDANÇA: Redireciona diretamente após o cadastro bem-sucedido
        setMessage('Cadastro realizado com sucesso! A redirecionar...');
        setTimeout(() => {
            if(isAdminSignUp) {
                router.push('/admin');
            } else {
                router.push('/dashboard');
            }
        }, 1500);
      }

    } else if (view === 'login') {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(`Falha no login: ${signInError.message}`);
      } else if (data.user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            setError("Não foi possível verificar a sua função. Tente novamente.");
        } else if (profile.role === 'admin') {
            router.push('/admin');
        } else {
            router.push('/dashboard'); 
        }
      }

    } else if (view === 'recover') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${location.origin}/auth/callback?next=/update-password`,
        });
        if (resetError) {
          setError(resetError.message);
        } else {
          setMessage('Se existir uma conta com este e-mail, receberá as instruções de recuperação.');
        }
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center">
            <Lock className="text-purple-600" size={64} strokeWidth={1.5} />
        </div>

        {view !== 'recover' ? (
          <div className="flex border-b">
            <button onClick={() => handleViewChange('login')} className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${view === 'login' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
              Entrar
            </button>
            <button onClick={() => handleViewChange('signup')} className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${view === 'signup' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
              Criar Conta
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-center text-gray-700">Recuperar Senha</h2>
        )}

        <form onSubmit={handleAuthAction} className="space-y-5 pt-4">
          {view === 'signup' && (
            <div className="flex space-x-4 animate-fade-in">
              <div className="relative w-1/2"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" required={view === 'signup'} className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
              <div className="relative w-1/2"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" required={view === 'signup'} className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
            </div>
          )}

          {view !== 'recover' ? (
            <>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={20} /></span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Lock size={20} /></span>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required minLength="4" title="A senha deve ter pelo menos 4 caracteres." className="w-full pl-10 pr-10 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </>
          ) : (
            <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={20} /></span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail da sua conta" required className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
          )}

          {view === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center"><input id="remember-me" type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" /><label htmlFor="remember-me" className="ml-2 text-gray-600">Lembrar-me</label></div>
              <button type="button" onClick={() => handleViewChange('recover')} className="font-medium text-purple-600 hover:underline">Esqueci a senha</button>
            </div>
          )}
          
          {error && <p className="text-sm text-center text-red-600 p-3 bg-red-100 rounded-lg">{error}</p>}
          {message && <p className="text-sm text-center text-green-600 p-3 bg-green-100 rounded-lg">{message}</p>}

          <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50">
            {loading ? <LoaderCircle className="animate-spin mx-auto"/> : (view === 'login' ? 'Entrar' : (view === 'signup' ? 'Criar Conta' : 'Enviar Instruções'))}
          </button>
        </form>

        {view !== 'recover' && (
            <div className="space-y-6 text-center pt-4">
                <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou entrar com</span></div></div>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => handleSocialLogin('google')} className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"><GoogleIcon /></button>
                    <button onClick={() => handleSocialLogin('facebook')} className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"><FacebookIcon /></button>
                </div>
            </div>
        )}
      </div>
    </div>
  )
}
