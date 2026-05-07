"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password_hash: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fadeError, setFadeError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
      const msg = data?.error?.includes('Duplicate') 
        ? '❌ This email is already registered!' 
        : '❌ Registration failed';
      setFadeError(msg);
      setTimeout(() => setFadeError(""), 3000);
      throw new Error(msg);
    }
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "48px auto" }}>
      <style>{`
      @keyframes fadeOut {
        0% { opacity: 1; }
        70% { opacity: 1; }
        100% { opacity: 0; }
        }
      `}</style>
      <h1>Register</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          required
        />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />

        {/*  Password with eye toggle */}
        <div style={{ position: "relative" }}>
          <input
            name="password_hash"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password_hash}
            onChange={onChange}
            required
            style={{ width: "100%", paddingRight: 40 }}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16
            }}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button disabled={saving}>
          {saving ? "Registering..." : "Register"}
        </button>

        {fadeError && (
        <div style={{
          color: 'crimson',
          padding: '10px',
          borderRadius: 6,
          background: '#2a0000',
          animation: 'fadeOut 3s forwards'
        }}>{fadeError}</div>
      )}
      </form>

      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
}