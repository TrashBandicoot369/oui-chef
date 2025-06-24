'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUser] = useState('');
  const [password, setPass] = useState('');
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log('Submitting login:', { username, password });
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      console.log('Login response status:', res.status);
      const data = await res.json();
      console.log('Login response data:', data);
      
      if (res.ok) {
        console.log('Login successful, redirecting to /admin');
        router.replace('/admin');
      } else {
        console.log('Login failed:', data);
        setErr('Wrong credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErr('Login failed');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-40 flex w-72 flex-col gap-4">
      <input
        className="border p-2"
        placeholder="Username"
        value={username}
        onChange={e => setUser(e.target.value)}
      />
      <input
        type="password"
        className="border p-2"
        placeholder="Password"
        value={password}
        onChange={e => setPass(e.target.value)}
      />
      <button type="submit" className="bg-black py-2 text-white">Log in</button>
      {err && <p className="text-red-500 text-sm">{err}</p>}
    </form>
  );
} 