// API for single anime
// GET - fetch one anime with tags and characters
// PUT - update anime
// DELETE - delete anime
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

//GET/api/anime
export async function GET(_request, { params }) {
  const { id } = params;
  const promisePool = mysqlPool.promise();

  //fetch anime
  const [rows] = await promisePool.query(`SELECT * FROM anime WHERE id = ?`, [id]);
  if (rows.length === 0) {
    return NextResponse.json({ message: `Anime with id ${id} not found` }, { status: 404 });
  }

  //fetch tags
  const [tags] = await promisePool.query(`SELECT * FROM tags WHERE anime_id = ?`, [id]);

  //fetch characters
  const[characters] = await promisePool.query(`SELECT * FROM characters WHERE anime_id = ?`, [id]);

 
  // Merge anime + tags  + characters
  const anime = { ...rows[0], tags, characters};

  return NextResponse.json(anime);
  
}

//POST/api/anime ->Create
export async function POST(request) {
    try {
        const body = await request.json();
        //return NextResponse.json(body);
        const{title, synopsis, coverimage, rating, trailer} = body;

        const promisePool = mysqlPool.promise();
        const [result] = await promisePool.query(
            `INSERT INTO anime (title, synopsis, coverimage, rating, trailer)
            VALUES (?,?,?,?,?)`,
            [title, synopsis, coverimage, rating, trailer]
        )

        const [rows] = await promisePool.query(
          `SELECT * FROM anime WHERE id = ?`,
          [result.insertId]
        )
        return NextResponse.json(rows[0], { status: 201 })
    }   catch (e) {
        return NextResponse.json(
          { error: e.message },
          { status: 500 }
        )
    }
}


export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, coverimage, synopsis, rating, trailer } = body;

    const promisePool = mysqlPool.promise();
    const [exists] = await promisePool.query(`SELECT id FROM anime WHERE id = ?`, [id]);
    if (exists.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    await promisePool.query(
      `UPDATE anime SET title=?,coverimage=?, synopsis=?, rating=?, trailer=? WHERE id=?`,
      [title, coverimage, synopsis, rating, trailer , id]
    );

    const [rows] = await promisePool.query(`SELECT * FROM anime WHERE id = ?`, [id]);
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

    const [exists] = await promisePool.query(`SELECT id FROM anime WHERE id = ?`, [id]);
    if (exists.length === 0) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Delete related records first (foreign key order matters)
    await promisePool.query(`DELETE FROM favorites WHERE anime_id = ?`, [id]);
    await promisePool.query(`DELETE FROM reactions WHERE anime_id = ?`, [id]);
    await promisePool.query(`DELETE FROM comments WHERE anime_id = ?`, [id]);
    await promisePool.query(`DELETE FROM tags WHERE anime_id = ?`, [id]);
    await promisePool.query(`DELETE FROM characters WHERE anime_id = ?`, [id]);

    // Now delete the anime
    await promisePool.query(`DELETE FROM anime WHERE id = ?`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}