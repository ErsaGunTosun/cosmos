'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    // Zaten giriş yapmışsa admin'e yönlendir
    useEffect(() => {
        fetch('/api/auth')
            .then(res => {
                if (res.ok) router.push('/admin');
                else setChecking(false);
            });
    }, [router]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
            router.push('/admin');
        } else {
            setError('Wrong credentials');
        }
        setLoading(false);
    }

    if (checking) return null;

    return (
        <div className="h-screen flex items-center justify-center bg-[var(--background)]">
            <form onSubmit={handleSubmit} className="w-72 flex flex-col gap-5 p-8">
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-semibold text-[var(--foreground)] tracking-tight">Noir</h1>
                    <p className="text-[10px] text-[var(--muted)] uppercase tracking-widest mt-1">Admin Access</p>
                </div>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-xl bg-white/50 outline-none focus:border-[var(--foreground)] focus:bg-white transition-all placeholder:text-[var(--muted)]"
                    autoFocus
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-[var(--border)] rounded-xl bg-white/50 outline-none focus:border-[var(--foreground)] focus:bg-white transition-all placeholder:text-[var(--muted)]"
                />

                {error && (
                    <p className="text-xs text-red-500 text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-sm font-medium text-white bg-[var(--foreground)] rounded-xl hover:opacity-90 active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
