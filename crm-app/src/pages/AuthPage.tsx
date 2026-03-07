import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { insforge } from "../lib/insforge";
import { Briefcase, Mail, Lock, User, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

type AuthMode = "signin" | "signup" | "verify";

export function AuthPage() {
    const [mode, setMode] = useState<AuthMode>("signin");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if already logged in
        insforge.auth.getCurrentSession().then(({ data }) => {
            if (data?.session) {
                navigate("/");
            }
        });
    }, [navigate]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data?.accessToken) {
            navigate("/");
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await insforge.auth.signUp({
            email,
            password,
            name,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data?.requireEmailVerification) {
            setMode("verify");
            setMessage("A verification code has been sent to your email.");
            setLoading(false);
        } else if (data?.accessToken) {
            navigate("/");
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error } = await insforge.auth.verifyEmail({
            email,
            otp: code,
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data?.accessToken) {
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />

            <div className="w-full max-w-md z-10">
                <div className="flex justify-center mb-8">
                    <div className="bg-indigo-500/20 p-3 rounded-2xl text-indigo-400 border border-indigo-500/30 shadow-[0_0_30px_rgba(99,102,241,0.3)]">
                        <Briefcase className="w-8 h-8" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent mb-2">
                        {mode === "signin" ? "Welcome Back" : mode === "signup" ? "Create Account" : "Verify Email"}
                    </h1>
                    <p className="text-neutral-500">
                        {mode === "signin" 
                            ? "Sign in to access your Nexus CRM" 
                            : mode === "signup" 
                            ? "Join our premium CRM platform" 
                            : "Enter the 6-digit code sent to your email"}
                    </p>
                </div>

                <div className="bg-neutral-900/40 backdrop-blur-2xl border border-neutral-800 p-8 rounded-3xl shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                    
                    <form onSubmit={mode === "signin" ? handleSignIn : mode === "signup" ? handleSignUp : handleVerify} className="space-y-6">
                        {mode === "signup" && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-neutral-700"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        {mode !== "verify" && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-neutral-700"
                                            placeholder="name@company.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Password</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-neutral-700"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {mode === "verify" && (
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider ml-1">Verification Code</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="w-full bg-neutral-950/50 border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-white placeholder:text-neutral-700 tracking-[0.5em] font-mono text-center"
                                        placeholder="000000"
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                                <div className="w-1 h-1 bg-red-400 rounded-full" />
                                {error}
                            </div>
                        )}

                        {message && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs py-3 px-4 rounded-xl flex items-center gap-2">
                                <div className="w-1 h-1 bg-emerald-400 rounded-full" />
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Verify"}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-neutral-800 text-center">
                        <button
                            onClick={() => {
                                setMode(mode === "signin" ? "signup" : "signin");
                                setError(null);
                                setMessage(null);
                            }}
                            className="text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            {mode === "signin" 
                                ? "Don't have an account? Sign up" 
                                : mode === "signup" 
                                ? "Already have an account? Sign in" 
                                : "Back to Sign In"}
                        </button>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-neutral-600">
                        Protected by Nexus Security • © 2024 Nexus CRM
                    </p>
                </div>
            </div>
        </div>
    );
}
