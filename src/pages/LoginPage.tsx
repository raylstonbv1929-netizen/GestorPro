import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Sprout } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [message, setMessage] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (mode === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Cadastro realizado! Verifique seu email para confirmar.');
                setMode('login');
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro ao tentar autenticar.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans overflow-hidden flex flex-col md:flex-row shadow-inner">
            {/* Background Grain Effect */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50"></div>

            {/* Visual Section - Massive Typographic Hero */}
            <div className="relative flex-1 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-slate-900 overflow-hidden group">
                {/* Asymmetric Ornament */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 transition-colors duration-1000 group-hover:bg-emerald-500/10"></div>

                <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-emerald-500 flex items-center justify-center">
                            <Sprout className="text-slate-950" size={28} strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-black tracking-tighter uppercase italic">AgroGest<span className="text-emerald-500">.</span></span>
                    </div>

                    <h1 className="text-6xl md:text-[120px] font-black leading-[0.85] tracking-tighter uppercase text-white/90 break-words max-w-2xl">
                        A Nova <br />
                        <span className="text-emerald-500 outline-text">Era do</span> <br />
                        Campo
                    </h1>
                </div>

                <div className={`mt-auto transition-all duration-1000 delay-300 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                    <p className="text-slate-500 max-w-sm text-sm uppercase tracking-widest leading-relaxed">
                        Tecnologia de ponta para gestão agrícola de alta performance.
                        Precisão, controle e produtividade em um só lugar.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <div className="h-px w-12 bg-slate-800 self-center"></div>
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em]">GestorPro v2.0</span>
                    </div>
                </div>
            </div>

            {/* Form Section - Floating extreme-edge tension */}
            <div className="w-full md:w-[450px] bg-slate-950 flex flex-col justify-center p-8 md:p-16 relative z-10">
                <div className={`transition-all duration-1000 delay-500 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0'}`}>
                    <div className="mb-12">
                        <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-2">
                            {mode === 'login' ? 'Acessar Sistema' : 'Criar Conta'}
                        </h2>
                        <p className="text-slate-500 text-sm">Insira suas credenciais abaixo</p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="bg-rose-500/5 border-l-2 border-rose-500 text-rose-500 p-4 text-xs font-bold flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}
                        {message && (
                            <div className="bg-emerald-500/5 border-l-2 border-emerald-500 text-emerald-500 p-4 text-xs font-bold flex items-start gap-4 animate-in fade-in slide-in-from-left-2 duration-300">
                                <AlertCircle size={18} className="shrink-0" />
                                <span>{message}</span>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="group space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-emerald-500">Email Corporativo</label>
                                <div className="relative border-b border-slate-800 transition-colors group-focus-within:border-emerald-500">
                                    <Mail className="absolute left-0 top-3 text-slate-600" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent pl-8 pr-4 py-3 text-sm text-white outline-none placeholder:text-slate-800"
                                        placeholder="nome@fazenda.com"
                                    />
                                </div>
                            </div>

                            <div className="group space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-emerald-500">Senha Segura</label>
                                <div className="relative border-b border-slate-800 transition-colors group-focus-within:border-emerald-500">
                                    <Lock className="absolute left-0 top-3 text-slate-600" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent pl-8 pr-4 py-3 text-sm text-white outline-none placeholder:text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {loading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Entrar Agora' : 'Finalizar Cadastro'}</span>
                                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-900">
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest text-center">
                            {mode === 'login' ? 'Ainda não é membro?' : 'Já possui acesso?'}
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null); }}
                                className="text-emerald-500 ml-2 hover:text-emerald-400 underline decoration-emerald-500/30 underline-offset-4"
                            >
                                {mode === 'login' ? 'Solicitar Acesso' : 'Efetuar Login'}
                            </button>
                        </p>
                    </div>
                </div>

                <div className="mt-auto pt-8 flex justify-center opacity-30">
                    <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-1.5 h-1.5 bg-slate-700"></div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .outline-text {
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
}

