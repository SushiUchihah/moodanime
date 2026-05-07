// ============================================================
// EDIT ANIME PAGE - app/anime/[id]/edit/page.js
// Purpose: Allows editing of an existing anime entry
// This page has 3 main parts:
// 1. STATE & SETUP
// 2. FUNCTIONS (useEffect, onChange, onSubmit)
// 3. RETURN (UI/Form)
// ============================================================
"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditAnimePage() {
  const params = useParams();               // Gets the anime id from the URL e.g. /anime/[id]/edit
  const id = params.id;                     // Extracts the id value
  const router = useRouter();               //Redirect the to page(link) after saving

  // ============================================================
  // PART 1: STATE - stores all form data and UI states
  // ============================================================
  const [form, setForm] = useState({
    title: "",
    synopsis: "",
    coverimage: "",
    rating: "",
    trailer: "",
    tags: [],                               // Array of tag strings e.g. ["Shonen", "Action"]
    characters: []                          // Array of character objects
  });
  const [tagInput, setTagInput] = useState("");             // Temporary input for new tag
  const [characterInput, setCharacterInput] = useState({    // Temporary input for new tag
    name: "",  role: "", description: "", image: ""         //to prevents updating before the user confirms
  })
  const [loading, setLoading] = useState(true);             //Take time while fetching data
  const [saving, setSaving] = useState(false);              //Fasle because we are not submitting anything yet
  const [error, setError] = useState("");                   //Empty because no error yet

  // ============================================================
  // PART 2: FUNCTIONS
  // ============================================================

 
  useEffect(() => {                                         // useEffect - runs once when page loads                                                            
    (async () => {                                          // Fetches existing anime data from API and pre-fills the form
      const res = await fetch(`/api/anime/${id}`);          //Data is being fetched from here api/anime of the id
      const data = await res.json();
      if (res.ok) {
            setForm({
                title: data.title ?? "",
                synopsis: data.synopsis ?? "",
                coverimage: data.coverimage ?? "",
                rating: data.rating ?? "",
                trailer: data.trailer ?? "",
                tags: data.tags ? data.tags.map(t => t.tag_name) : [],      // Converts tag objects to strings
                characters: data.characters ?? []
            });
        }
      else {
        setError(data?.error || "Not found");                               //error handle
      }
      setLoading(false);                                                    //after fetching data loading is false
    })();
  }, [id]);

  const onChange = (e) =>                                                   // onChange - updates form state when user types in any input field
    setForm({ ...form, [e.target.name]: e.target.value });                  //title will be what you type
  const onCharacterChange = (e) => setCharacterInput({ ...characterInput, [e.target.name]: e.target.value }); //update character when user types

  async function onSubmit(e) {                          // onSubmit - called when Save Changes button is clicked
    e.preventDefault();                                 // prevent refreshing
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/anime/${id}`, {                     // Step 1: PUT request to update anime basic info
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Update failed");
      await fetch(`/api/tags/${id}`, { method: "DELETE" });             // Step 2: DELETE old tags and characters
        await fetch(`/api/characters/${id}`, { method: "DELETE" });
        // Save tags
        for (const tag of form.tags) {
            await fetch("/api/tags", {
                method: "POST",                                         // Step 3: POST new tags one by one
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ anime_id: data.id, tag_name: tag })
            });
        }
        // Save characters
        for (const char of form.characters) {
            await fetch("/api/characters", {
                method: "POST",                                         // Step 4: POST new characters one by one
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ anime_id: data.id, ...char })
            });
        }
      router.push(`/anime/${id}`);                                      // Step 5: Redirect back to anime detail page
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);                                                 //request finish and back to save -> false
    }
  }
//this is to write in anime page-> title, synopsis, characters, tags, etc.....
  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: 640, margin: "24px auto" }}>               
      <h1>Edit Anime</h1>
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

        <button disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </button>
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
        </form>
        <p>
        <Link href={`/anime/${id}`}>Cancel</Link>
        </p>
    </div>

  );
}
