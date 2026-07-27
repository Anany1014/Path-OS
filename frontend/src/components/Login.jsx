import React, { useState } from "react";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState("idle"); // 'idle' | 'authenticating' | 'granted'

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Credentials cannot be empty.");
            return;
        }

        setError("");
        setStatus("authenticating");

        // Simulate a cool cyber login processing
        setTimeout(() => {
            setStatus("granted");
            setTimeout(() => {
                onLogin(username);
            }, 1000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[99999] bg-slate-950 flex items-center justify-center animate-fade-in">
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />

            {/* Grid overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(16,245,160,0.5) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />

            <div className="relative w-full max-w-md mx-4 p-8 glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col gap-6">
                {/* Header */}
                <div className="text-center flex flex-col gap-2">
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(16,245,160,0.3)] animate-pulse">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-black text-white tracking-wider font-mono">PATH OS TERMINAL</h1>
                    <p className="text-xs text-slate-400">Climate-Aware Urban Navigation Console Access</p>
                </div>

                {status === "idle" && (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Operator Identity</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter Username (e.g. Operator)"
                                className="glass-input text-sm text-white"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Console Access Key</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="glass-input text-sm text-white"
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl px-3 py-2 font-mono">
                                ⚠️ ERROR: {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 transition-all duration-200 shadow-[0_0_20px_rgba(16,245,160,0.15)] active:scale-95"
                        >
                            Authorize Uplink
                        </button>
                    </form>
                )}

                {status === "authenticating" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <div className="text-xs font-mono text-emerald-400 animate-pulse tracking-wide">
                            VALIDATING CREDENTIALS...
                        </div>
                    </div>
                )}

                {status === "granted" && (
                    <div className="flex flex-col items-center justify-center py-8 gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,245,160,0.4)]">
                            <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-sm font-mono font-bold text-emerald-300 tracking-wider">
                            ACCESS GRANTED
                        </div>
                    </div>
                )}

                {/* Footer status */}
                <div className="text-[10px] text-slate-500 text-center font-mono border-t border-white/5 pt-4">
                    SECURED WORKSTATION // PORT 3001 ACTIVE
                </div>
            </div>
        </div>
    );
}
