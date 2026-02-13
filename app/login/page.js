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
        <div className="h-screen flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-72 flex flex-col gap-4">
                <h1 className="text-center text-lg font-semibold text-[var(--foreground)] tracking-tight mb-2">
                    cosmos
                </h1>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white outline-none focus:border-[var(--foreground)] transition-colors"
                    autoFocus
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white outline-none focus:border-[var(--foreground)] transition-colors"
                />

                {error && (
                    <p className="text-xs text-red-500 text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 text-sm font-medium text-white bg-[var(--foreground)] rounded-lg hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                >
                    {loading ? '...' : 'Enter'}
                </button>
            </form>
        </div>
    );
}
