// Global navbar shown on every page
// Reads sessionStorage to check if user is logged in
// Shows Login/Register if not logged in
// Shows profile picture, username, Logout button if logged in
// onLogout() clears sessionStorage and redirects to login
"use client"
import { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";
import Link from 'next/link'

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

useEffect(() => {
  function checkUser() {
    const stored = sessionStorage.getItem("user");
    setCurrentUser(stored ? JSON.parse(stored) : null);
  }
  checkUser();
  window.addEventListener('focus', checkUser);
  window.addEventListener('userLogin', checkUser); // 👈 add this
  return () => {
    window.removeEventListener('focus', checkUser);
    window.removeEventListener('userLogin', checkUser); // 👈 add this
  };
}, []);

  function onLogout() {
    sessionStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/login");
  }

  return (
    <nav>
      <a href="/">🎌 MoodAnime</a>
      <a href="/anime">Browse</a>
      {currentUser && (
        <a href="/anime/new">+ Add Anime</a>
      )}
      {currentUser && (
        <a href="/users">Mooders</a>
      )}
      {currentUser?.is_admin === 1 && (
          <a href="/admin">⚙️ Admin</a>
        )}
      <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12}}>
        {currentUser ? (
          <>
            <img src={currentUser.profileimage || "/default-avatar.png"} width={35} height={35} style={{borderRadius: '50%', border: '2px solid #ff2d2d'}}/>
            <a href={`/users/${currentUser.id}`}>{currentUser.username}</a>
            <button onClick={onLogout} style={{padding: '4px 12px'}}>Logout</button>
          </>
        ) : (
          <>
            <a href="/login">Login</a>
            <a href="/register">Register</a>
          </>
        )}
      </div>
    </nav>
  )
}