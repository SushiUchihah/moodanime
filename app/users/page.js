"use client"
import React, { useEffect, useState } from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link'


export default function Page() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const router = useRouter()
  
  useEffect(() => {

    const user = JSON.parse(sessionStorage.getItem("user") || "null");
      if (!user) {
        router.push('/login');
        return;
      }
    setLoading(true);
    let url = `/api/users`;
    if (query) url = `${url}?search=${query}`;

    async function fetchUsers() {
      try {
        const res = await fetch(url);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [query]);

  if (loading) return <div>Loading...</div>;

  // Filter users by search term if needed
  const filtered = users.filter(u =>
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2>Find Users</h2>

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        <input
          type='text'
          placeholder='Search User...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setQuery(search)}>🔎</button>
        <button onClick={() => { setSearch(""); setQuery(""); }}>Reset</button>
      </div>

      {filtered.map((user) => (
        <div className="user-card" key={user.id}>
          <div className="user-card-body" style={{display: 'flex', alignItems: 'center', gap: 12}}>
            <img 
              src={user.profileimage || "/default-avatar.png"} 
              width={50} 
              height={50} 
              style={{borderRadius: '50%', border: '2px solid #ff2d2d', objectFit: 'cover'}} 
              alt={user.username}
            />
            <div>
              <h2>{user.username}</h2>
              <p>{user.email}</p>
              <Link href={`/users/${user.id}`}>View Profile</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
