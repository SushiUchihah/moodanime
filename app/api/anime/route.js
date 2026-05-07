// API for anime list
// GET - fetch all anime with search filter + tags
// POST - create new anime
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(req) {
  const { search } = Object.fromEntries(new URL(req.url).searchParams);
  const promisePool = mysqlPool.promise();

  let sql = "SELECT * FROM anime WHERE approved = 1";
  let params = [];

  if (search) {
    sql += " AND title LIKE ?";
    params = [`%${search}%`];
  }

  const [animeRows] = await promisePool.query(sql, params);   // Fetch anime
  const [tagsRows] = await promisePool.query("SELECT * FROM tags");   // Fetch tags for all anime in one go

  const result = animeRows.map(anime => {
    const tagsForAnime = tagsRows.filter(tag => tag.anime_id === anime.id);
    return { ...anime, tags: tagsForAnime };
  });

  return NextResponse.json(result);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const promisePool = mysqlPool.promise();
    const { title, coverimage, synopsis, rating, trailer, is_admin } = body;

    const approved = is_admin === 1 ? 1 : 0; // admin gets auto-approved

    const [result] = await promisePool.query(
      `INSERT INTO anime (title, coverimage, synopsis, rating, trailer, approved) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, coverimage, synopsis, rating, trailer, approved]
    );
    const [rows] = await promisePool.query(
      `SELECT * FROM anime WHERE id = ?`, [result.insertId]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}