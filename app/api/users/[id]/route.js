// API for single user
// GET - fetch one user with their comments, reactions, favorites
// PUT - update user profile
// DELETE - delete user
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

//GET/api/user
export async function GET(_request, { params }) {
  const { id } = await params;
  const promisePool = mysqlPool.promise();

  //fetch user
  const [rows] = await promisePool.query(`SELECT * FROM users WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return NextResponse.json({ message: `User with id ${id} not found` }, { status: 404 });
  }

  //fetch comments
  const [comments] = await promisePool.query(`SELECT * FROM comments WHERE user_id = ?`, [id]);

  //fetch characters
  const[reactions] = await promisePool.query(`SELECT * FROM reactions WHERE user_id = ?`, [id]);

  //fetch favorites
  const [favorites] = await promisePool.query(
    `SELECT favorites.*, anime.title, anime.coverimage 
    FROM favorites 
    JOIN anime ON favorites.anime_id = anime.id 
    WHERE favorites.user_id = ?`, [id]
    );

  // Merge users + comments  + reactions + favorites
  const user = { ...rows[0], comments, reactions, favorites };

  return NextResponse.json(user); //call back the mearge result
  
}


export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { username, email, password_hash, profileimage } = body;

    const promisePool = mysqlPool.promise();
    const [exists] = await promisePool.query(`SELECT id FROM users WHERE id = ?`, [id]);
    if (exists.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    await promisePool.query(
      `UPDATE users SET username=?, email=?, password_hash=?, profileimage=? WHERE id=?`,
      [username, email, password_hash, profileimage, id]
    );

    const [rows] = await promisePool.query(`SELECT * FROM users WHERE id = ?`, [id]);
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
//Delete
export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const promisePool = mysqlPool.promise();

    const [exists] = await promisePool.query(`SELECT id FROM users WHERE id = ?`, [id]);
    if (exists.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    await promisePool.query(`DELETE FROM users WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}