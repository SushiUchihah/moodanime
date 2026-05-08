// Reactions API for a specific anime
// GET - fetch reaction counts grouped by type (like, love, dislike, hate)
// POST - add new reaction from logged in user
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function GET(_request, { params }) {
  const { anime_id } =await params;
  const promisePool = mysqlPool.promise();
  // Count reactions grouped by type
  const [rows] = await promisePool.query(
    `SELECT reaction_type, COUNT(*) AS count 
     FROM reactions 
     WHERE anime_id = ? 
     GROUP BY reaction_type`,
    [anime_id]
  );

  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  try {
    const { anime_id } =await params;
    const body = await request.json();
    const { reaction_type, user_id } = body;
    const promisePool = mysqlPool.promise();

    // Check first
    const [existing] = await promisePool.query(
      `SELECT * FROM reactions WHERE anime_id = ? AND user_id = ?`,
      [anime_id, user_id]
    );

    if (existing.length > 0) {
      await promisePool.query(
        `UPDATE reactions SET reaction_type = ? WHERE anime_id = ? AND user_id = ?`,
        [reaction_type, anime_id, user_id]
      );
    } else {
      await promisePool.query(
        `INSERT INTO reactions (anime_id, user_id, reaction_type) VALUES (?, ?, ?)`,
        [anime_id, user_id, reaction_type]
      );
    }

    // Then return counts
    const [counts] = await promisePool.query(
      `SELECT reaction_type, COUNT(*) AS count FROM reactions WHERE anime_id = ? GROUP BY reaction_type`,
      [anime_id]
    );
    return NextResponse.json(counts, { status: 201 });

  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { anime_id } = await params;
    const body = await request.json();
    const { user_id } = body;
    const promisePool = mysqlPool.promise();
    await promisePool.query(
      `DELETE FROM reactions WHERE anime_id = ? AND user_id = ?`,
      [anime_id, user_id]
    );
    const [counts] = await promisePool.query(
      `SELECT reaction_type, COUNT(*) AS count FROM reactions WHERE anime_id = ? GROUP BY reaction_type`,
      [anime_id]
    );
    return NextResponse.json(counts);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
