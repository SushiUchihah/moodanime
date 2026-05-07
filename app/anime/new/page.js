"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NewAnimePage() {
  const router = useRouter();

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user") || "null");
    if (!user) {
      router.push('/login');
      return;
    }
  }, []);

  const [form, setForm] = useState({
    title: "", synopsis: "", coverimage: "", rating: "", trailer: "", tags: [], characters: []
  });
  const [tagInput, setTagInput] = useState("");
  const [characterInput, setCharacterInput] = useState({
    name: "",  role: "", description: "", image: ""
  })

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onCharacterChange = (e) => setCharacterInput({ ...characterInput, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const user = JSON.parse(sessionStorage.getItem("user") || "null");

      const res = await fetch("/api/anime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, is_admin: user?.is_admin || 0 })
      });
      const data = await res.json();

    if (!res.ok) throw new Error(data?.error || "Create failed");

    // Save tags
    for (const tag of form.tags) {
        await fetch("/api/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anime_id: data.id, tag_name: tag })
        });
    }

    // Save characters
    for (const char of form.characters) {
        await fetch("/api/characters", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ anime_id: data.id, ...char })
        });
    }

    if (user?.is_admin === 1) {
      router.push(`/anime/${data.id}`);
    } else {

    router.push(`/anime/pending`);
    }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "24px auto" }}>
      <h1>Create Anime</h1>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          required
        />
        <input
          name="coverimage"
          placeholder="Cover Image URL"
          value={form.coverimage}
          onChange={onChange}
          required
        />
        <textarea
          name="synopsis"
          placeholder="Synopsis"
          rows={4}
          value={form.synopsis}
          onChange={onChange}
        />
        <input
          name="rating"
          placeholder="Rating"
          value={form.rating}
          onChange={onChange}
        />
        <input
          name="trailer"
          placeholder="Trailer Link"
          value={form.trailer}
          onChange={onChange}
          required
        />
        <div>
        <div style={{display: 'flex', gap: 8}}>
          <input
            list="tag-suggestions"
            placeholder="Add tag (e.g. Shonen, Hype)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
          />
          <datalist id="tag-suggestions">
            <option value="Shonen"/>
            <option value="Shojo"/>
            <option value="Isekai"/>
            <option value="Action"/>
            <option value="Adventure"/>
            <option value="Comedy"/>
            <option value="Drama"/>
            <option value="Fantasy"/>
            <option value="Horror"/>
            <option value="Mystery"/>
            <option value="Romance"/>
            <option value="Sci-Fi"/>
            <option value="Supernatural"/>
            <option value="Psychological"/>
            <option value="Detective"/>
            <option value="Mecha"/>
            <option value="Sports"/>
            <option value="School"/>
            <option value="Historical"/>
            <option value="Games"/>
            <option value="Hype"/>
            <option value="Happy"/>
            <option value="Sad"/>
            <option value="Epic"/>
            <option value="Dark Tone"/>
            <option value="Competitive"/>
          </datalist>
            <button type="button" onClick={() => {
            if (tagInput.trim()) {
                setForm({...form, tags: [...form.tags, tagInput.trim()]});
                setTagInput("");
            }
            }}>+ Tag</button>
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8}}>
            {form.tags.map((tag, i) => (
            <span key={i} className="tag-pill">
                {tag} <button type="button" onClick={() => setForm({...form, tags: form.tags.filter((_, idx) => idx !== i)})}>✕</button>
            </span>
            ))}
        </div>
        </div>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
      
        <div>
            <h3>Characters</h3>
            <div style={{display: 'grid', gap: 8}}>
                <input name="name" placeholder="Character Name" value={characterInput.name} onChange={onCharacterChange}/>
                <input
                  list="role-suggestions"
                  name="role"
                  placeholder="Role eg. Main(Protagonist)/ Main/ Side/ Supporting/ Villain..."
                  value={characterInput.role}
                  onChange={onCharacterChange}
                />
                <datalist id="role-suggestions">
                  <option value="Main (Protagonist)"/>
                  <option value="Main"/>
                  <option value="Supporting"/>
                  <option value="Side"/>
                  <option value="Villain"/>
                  <option value="Antagonist"/>
                </datalist>
                <input name="description" placeholder="Description" value={characterInput.description} onChange={onCharacterChange}/>
                <input name="image" placeholder="Character Image URL" value={characterInput.image} onChange={onCharacterChange}/>
                <button type="button" onClick={() => {
                if (characterInput.name.trim()) {
                    setForm({...form, characters: [...form.characters, characterInput]});
                    setCharacterInput({name: "", role: "", description: "", image: ""});
                }
                }}>+ Add Character</button>
            </div>
            {form.characters.map((c, i) => (
                <div key={i} style={{background: '#1a1a1a', padding: 8, borderRadius: 8, margin: '8px 0', display: 'flex', justifyContent: 'space-between'}}>
                <span>{c.name} — {c.role}</span>
                <button type="button" onClick={() => setForm({...form, characters: form.characters.filter((_, idx) => idx !== i)})}>✕</button>
                </div>
            ))}
        </div>
        <div style={{display: 'flex', gap: 12, marginTop: 8}}>
          <button disabled={saving} style={{flex: 1, padding: '12px', background: '#ff2d2d', border: 'none', color: 'white', borderRadius: 8, fontSize: '1rem', cursor: 'pointer'}}>
            {saving ? "Saving..." : "✨ Create Anime"}
          </button>
          <Link href="/anime" style={{flex: 1, padding: '12px', border: '1px solid #555', color: '#aaa', borderRadius: 8, fontSize: '1rem', textAlign: 'center', display: 'block'}}>
            ← Cancel
          </Link>
        </div>
        </form>
    </div>
  );
}
