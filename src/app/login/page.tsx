"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// --- ÍCONES DE MARCAS (mantidos como SVG para melhor controlo) ---
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
);
const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
);
const AppleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-gray-800"><path d="M12.15,2.23a4.73,4.73,0,0,0-3.3,1.38,4.48,4.48,0,0,1-1.33-3.13,4.19,4.19,0,0,0-3.43,4.3,9.53,9.53,0,0,0,5.55,8.68,8.14,8.14,0,0,1-2.25,3.33,1,1,0,0,0,.11,1.44,1,1,0,0,0,.63.26,1,1,0,0,0,.74-.37,10.23,10.23,0,0,0,3.12-4.1,9.74,9.74,0,0,0,3.25,4.11,1,1,0,0,0,.74.37,1,1,0,0,0,.63-.26,1,1,0,0,0,.11-1.44,8.13,8.13,0,0,1-2.26-3.33,9.48,9.48,0,0,0,5.51-8.65,4.2,4.2,0,0,0-3.5-4.32Z"/></svg>
);

export default function LoginPage() {
  const [view, setView] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true); // inicia como true para mostrar o spinner
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  // userRole removido, cadastro é apenas para proprietários
  const router = useRouter();

  // Loading visual ao abrir a página
  useEffect(() => {
    // Limpa todos os campos ao montar a tela de login
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setError(null);
    setMessage(null);
    const timeout = setTimeout(() => setLoading(false), 400); // 400ms para UX
    return () => clearTimeout(timeout);
  }, []);

  const handleAuthAction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (view === 'signup') {
      // Cria usuário proprietário na tabela users
      const { error } = await supabase.from('users').insert([
        {
          email,
          password, // Em produção, nunca salve senha em texto puro!
          name: `${firstName} ${lastName}`,
          role: 'proprietario',
          active: true,
        },
      ]);
      if (error) {
        setError('Erro ao cadastrar: ' + error.message);
        setLoading(false);
        return;
      }
      setMessage('Cadastro realizado com sucesso! A redirecionar...');
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else if (view === 'login') {
      // Admin login
      if (email === 'paulokakoma19@gmail.com' && password === '9898') {
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify({ email, role: 'admin' }));
        }
        setEmail('');
        setPassword('');
        router.push('/admin');
        return;
      }
      // Busca usuário comum
      const { data: users, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password);
      if (error || !users || users.length === 0) {
        setError('Usuário ou senha inválidos.');
        setLoading(false);
        return;
      }
      // Salva usuário logado no localStorage (mock de sessão)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(users[0]));
      }
      setEmail('');
      setPassword('');
      if (users[0].role === 'proprietario') {
        router.push('/dashboard');
      } else {
        router.push('/screen');
      }
    } else if (view === 'recover') {
      alert('A lógica de recuperação de senha está comentada para esta pré-visualização.');
      setMessage('Se existir uma conta com este e-mail, receberá as instruções de recuperação.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span className="text-gray-700 font-semibold">Carregando página de login...</span>
        </div>
      </div>
    );
  }

  // Handler de login social
  const handleSocialLogin = async (provider: 'google' | 'facebook' | 'apple') => {
    setLoading(true);
    alert(`A lógica de login social com ${provider} está comentada para esta pré-visualização.`);
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200 p-4">
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <div className="flex justify-center">
            <Lock className="text-purple-600" size={64} strokeWidth={1.5} />
        </div>
        {view !== 'recover' ? (
          <div className="flex border-b">
            <button onClick={() => setView('login')} className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${view === 'login' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
              Entrar
            </button>
            <button onClick={() => setView('signup')} className={`w-1/2 py-3 text-center font-semibold transition-colors duration-300 ${view === 'signup' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-purple-600'}`}>
              Criar Conta
            </button>
          </div>
        ) : (
          <h2 className="text-xl font-semibold text-center text-gray-700">Recuperar Senha</h2>
        )}
        <form onSubmit={handleAuthAction} className="space-y-5 pt-4">
          {/* Objetivo removido do cadastro */}
          {view === 'signup' && (
            <div className="flex space-x-4 animate-fade-in">
              <div className="relative w-1/2"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" required={view === 'signup'} className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
              <div className="relative w-1/2"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><User size={20} /></span><input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" required={view === 'signup'} className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
            </div>
          )}
          {view !== 'recover' ? (
            <>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={20} /></span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
              <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Lock size={20} /></span><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" required className="w-full pl-10 pr-10 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button></div>
            </>
          ) : (
            <div className="relative"><span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><Mail size={20} /></span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail da sua conta" required className="w-full pl-10 pr-4 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500" /></div>
          )}
          {view === 'login' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center"><input id="remember-me" type="checkbox" className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" /><label htmlFor="remember-me" className="ml-2 text-gray-600">Lembrar-me</label></div>
              <button type="button" onClick={() => setView('recover')} className="font-medium text-purple-600 hover:underline">Esqueci a senha</button>
            </div>
          )}
          {error && <p className="text-sm text-center text-red-600">{error}</p>}
          {message && <p className="text-sm text-center text-green-600">{message}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50">
            {loading ? 'Aguarde...' : (view === 'login' ? 'Entrar' : (view === 'signup' ? 'Criar Conta' : 'Enviar Instruções'))}
          </button>
        </form>
        {view !== 'recover' ? (
            <div className="space-y-6 text-center pt-4">
                <div className="relative"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Ou entrar com</span></div></div>
                <div className="flex justify-center space-x-4">
                    <button onClick={() => handleSocialLogin('google')} className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"><GoogleIcon /></button>
                    <button onClick={() => handleSocialLogin('facebook')} className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"><FacebookIcon /></button>
                    <button onClick={() => handleSocialLogin('apple')} className="p-3 border border-gray-300 rounded-full hover:bg-gray-100 transition-colors"><AppleIcon /></button>
                </div>
            </div>
        ) : (
            <div className="text-sm text-center pt-4">
                <button onClick={() => setView('login')} className="font-medium text-purple-600 hover:underline">Voltar para o Login</button>
            </div>
        )}
      </div>
    </div>
  );
}
