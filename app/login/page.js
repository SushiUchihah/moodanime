"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Page() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password_hash: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fadeError, setFadeError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setFadeError("❌ Incorrect username or password");
        setTimeout(() => setFadeError(""), 3000); // fade after 3 seconds
        throw new Error("Login failed");
      }
      sessionStorage.setItem("user", JSON.stringify(data));
      sessionStorage.removeItem("popupShown");
      window.dispatchEvent(new Event('userLogin'));
      router.push("/anime");
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
      <h1>Login</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          required
        />

        {/* Password field with eye button */}
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
          {saving ? "Logging in..." : "Login"}
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
        Don't have an account? <Link href='/register'>Register</Link>
      </p>
    </div>
  );
}