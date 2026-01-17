import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Mail, Lock, Loader2, AlertCircle, ArrowRight, Sprout, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [message, setMessage] = useState<string | null>(null);

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
                    options: {
                        emailRedirectTo: window.location.origin,
                    }
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
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-[440px] z-10"
            >
                <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Glassmorphism Highlight */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <div className="flex flex-col items-center mb-10">
                        <motion.div
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            whileTap={{ scale: 0.95 }}
                            className="h-16 w-16 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-6"
                        >
                            <Sprout className="text-slate-950" size={32} strokeWidth={2.5} />
                        </motion.div>
                        <h1 className="text-4xl font-black text-white tracking-tight mb-2">
                            Agro<span className="text-emerald-500">Gest</span>
                        </h1>
                        <p className="text-slate-400 font-medium">Sistema de Gestão Agrícola Inteligente</p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.form
                            key={mode}
                            initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
                            transition={{ duration: 0.3 }}
                            onSubmit={handleAuth}
                            className="space-y-5"
                        >
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm flex items-center gap-3"
                                >
                                    <AlertCircle size={18} className="shrink-0" />
                                    <p className="font-medium">{error}</p>
                                </motion.div>
                            )}

                            {message && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-3"
                                >
                                    <CheckCircle2 size={18} className="shrink-0" />
                                    <p className="font-medium">{message}</p>
                                </motion.div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider ml-1">Endereço de Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="exemplo@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Senha de Acesso</label>
                                    {mode === 'login' && (
                                        <button type="button" className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors">
                                            Esqueceu a senha?
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4 group"
                            >
                                {loading ? (
                                    <Loader2 size={22} className="animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-lg">{mode === 'login' ? 'Entrar no Sistema' : 'Criar Minha Conta'}</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </motion.form>
                    </AnimatePresence>

                    <div className="mt-10 text-center relative">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0f172a] px-4 text-slate-500 font-bold tracking-widest">Ou continue com</span>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 font-medium">
                            {mode === 'login' ? 'Ainda não tem acesso?' : 'Já possui uma conta?'}
                            <button
                                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setMessage(null); }}
                                className="text-emerald-500 font-black ml-2 hover:text-emerald-400 transition-colors outline-none"
                            >
                                {mode === 'login' ? 'Cadastre-se agora' : 'Faça login aqui'}
                            </button>
                        </p>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-8 font-medium">
                    &copy; {new Date().getFullYear()} AgroGest Pro. Todos os direitos reservados.
                </p>
            </motion.div>
        </div>
    );
}
