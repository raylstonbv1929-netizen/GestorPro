import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight, Sprout, ShieldCheck, Zap, Cpu, Terminal, Activity, ShieldAlert } from 'lucide-react';

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
                setMessage('Protocolo iniciado! Verifique seu vetor de e-mail.');
                setMode('login');
            }
        } catch (err: any) {
            setError(err.message || 'Falha na autenticação do núcleo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 overflow-hidden flex flex-col md:flex-row relative">
            {/* Background Texture & Scanner Line */}
            <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-50 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-scanner shadow-[0_0_15px_#10b981]" />
            </div>

            {/* Left Section - Tactical Branding */}
            <div className="relative flex-1 flex flex-col justify-between p-12 md:p-24 border-b md:border-b-0 md:border-r border-slate-900/60 overflow-hidden group">
                {/* Sentinel Stripe */}
                <div className="absolute top-0 right-0 w-1 md:w-1.5 h-full bg-emerald-500/20 z-20" />

                {/* Asymmetric Light Cluster */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] -ml-64 -mt-64 rounded-full" />

                <div className={`relative z-10 transition-all duration-1000 ease-out transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
                    <div className="flex items-center gap-5 mb-24">
                        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center rounded-2xl shadow-lg shadow-emerald-500/5 group-hover:bg-emerald-500 transition-all duration-500">
                            <Sprout className="text-emerald-500 group-hover:text-slate-950 transition-colors" size={32} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">Gestor<span className="text-emerald-500">Pro</span></span>
                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] mt-1 italic">Industrial SpeedGrid™ v5.0</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-[clamp(3.5rem,8vw,8rem)] font-black leading-[0.8] tracking-tighter uppercase text-white lg:max-w-3xl drop-shadow-2xl italic">
                            A Nova <br />
                            <span className="text-emerald-500 outline-text">Matriz do</span> <br />
                            Campo
                        </h1>
                    </div>
                </div>

                <div className={`relative z-10 mt-auto transition-all duration-1000 delay-300 ease-out ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 group/stats">
                            <Activity size={16} className="text-emerald-500 group-hover/stats:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white italic">REALTIME</span>
                        </div>
                        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1 group/stats">
                            <ShieldCheck size={16} className="text-emerald-500 group-hover/stats:scale-110 transition-transform" />
                            <span className="text-[10px] font-black text-white italic">ECO_SEC</span>
                        </div>
                        <div className="max-w-xs ml-4">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed italic">
                                Engenharia de dados aplicada à produtividade agropecuária de alta precisão.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Authentic Access Terminal */}
            <div className="w-full md:w-[600px] bg-slate-950 flex flex-col justify-center p-12 md:p-24 relative z-10">
                <div className={`transition-all duration-1000 delay-500 ease-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                    <div className="mb-16">
                        <div className="flex items-center gap-3 mb-4">
                            <Terminal size={18} className="text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Acesso Restrito ao Núcleo</span>
                        </div>
                        <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">
                            {mode === 'login' ? 'Autenticar Operador' : 'Homologar Novo Id'}
                        </h2>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-8">
                        {error && (
                            <div className="bg-rose-500/5 border-l-4 border-rose-500 p-5 rounded-r-2xl animate-in fade-in slide-in-from-left-4 duration-500 flex items-start gap-4">
                                <ShieldAlert size={20} className="text-rose-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Falha de Autenticação</p>
                                    <p className="text-[11px] font-bold text-rose-400 italic">{error}</p>
                                </div>
                            </div>
                        )}
                        {message && (
                            <div className="bg-emerald-500/5 border-l-4 border-emerald-500 p-5 rounded-r-2xl animate-in fade-in slide-in-from-left-4 duration-500 flex items-start gap-4">
                                <ShieldCheck size={20} className="text-emerald-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Protocolo Emitido</p>
                                    <p className="text-[11px] font-bold text-emerald-500/80 italic">{message}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 transition-colors group-focus-within:text-emerald-400">Vetor de E-mail Corporativo</label>
                                <div className="relative border-b-2 border-slate-900/60 transition-all group-focus-within:border-emerald-500 shadow-inner">
                                    <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-700 transition-colors group-focus-within:text-emerald-500" size={18} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent pl-10 pr-4 py-4 text-sm font-black text-white outline-none placeholder:text-slate-800 italic uppercase"
                                        placeholder="EX: ADMIN@SPEEDGRID.COM"
                                    />
                                </div>
                            </div>

                            <div className="group space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic ml-1 transition-colors group-focus-within:text-emerald-400">Chave de Integridade (Senha)</label>
                                <div className="relative border-b-2 border-slate-900/60 transition-all group-focus-within:border-emerald-500 shadow-inner">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-700 transition-colors group-focus-within:text-emerald-500" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent pl-10 pr-4 py-4 text-sm font-black text-white outline-none placeholder:text-slate-800"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-18 py-6 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black uppercase text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden active:scale-[0.98] border-b-4 border-emerald-800 shadow-2xl shadow-emerald-500/20 italic"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <span>{mode === 'login' ? 'Acessar Terminal' : 'Finalizar Registro'}</span>
                                    <ArrowRight size={20} className="transition-transform group-hover:translate-x-2" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-16 pt-8 border-t border-slate-900/60">
                        <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] text-center italic">
                            {mode === 'login' ? 'Falta de credenciais?' : 'Ja possui acesso tático?'}
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null); }}
                                className="text-emerald-500 ml-3 hover:text-emerald-400 transition-colors underline underline-offset-8 decoration-emerald-500/20"
                            >
                                {mode === 'login' ? 'Habilitar Perfil' : 'Efetuar Login'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Trace Ornament */}
                <div className="mt-auto flex justify-center pt-12 gap-1.5 opacity-20 group">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-2 h-0.5 bg-slate-800 group-hover:bg-emerald-500 transition-colors" />
                    ))}
                </div>
            </div>

            <style>{`
                .outline-text {
                    color: transparent;
                    -webkit-text-stroke: 1px rgba(16, 185, 129, 0.4);
                }
                @keyframes scanner {
                    0% { top: -10%; }
                    100% { top: 110%; }
                }
                .animate-scanner {
                    animation: scanner 4s linear infinite;
                }
            `}</style>
        </div>
    );
}
