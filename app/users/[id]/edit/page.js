"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditUserPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    profileimage: "",
    email: "",
    password_hash: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/users/${id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          username: data.username ?? "",
          email: data.email ?? "",
          profileimage: data.profileimage ?? "",
          password_hash: data.password_hash ?? "",
        });
      } else {
        setError(data?.error || "Not found");
      }
      setLoading(false);
    })();
  }, [id]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      router.push(`/users/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 640, margin: "24px auto" }}>
      <h1>Edit Users</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="username"
          placeholder="Name"
          value={form.username}
          onChange={onChange}
          required
        />
        <input
          name="profileimage"
          placeholder="Profile Image URL"
          value={form.profileimage}
          onChange={onChange}
          required
        />
        <textarea
          name="email"
          placeholder="Email"
          rows={4}
          value={form.email}
          onChange={onChange}
        />
        <input
          name="password_hash"
          placeholder="PASSWORD"
          value={form.password_hash}
          onChange={onChange}
        />
        <button disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </form>

      <p>
        <Link href={`/users/${id}`}>Cancel</Link>
      </p>
    </div>
  );
}
