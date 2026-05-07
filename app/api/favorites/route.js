// Favorites/watchlist API
// POST - add or update anime in user's watchlist with status
// DELETE - remove anime from watchlist
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function POST(request) {
  try {
    const body = await request.json();
    const { anime_id, user_id, status } = body;
    const promisePool = mysqlPool.promise();
    
    const [existing] = await promisePool.query(
      `SELECT id FROM favorites WHERE anime_id = ? AND user_id = ?`,
      [anime_id, user_id]
    );

    if (existing.length > 0) {
      await promisePool.query(
        `UPDATE favorites SET status = ? WHERE anime_id = ? AND user_id = ?`,
        [status, anime_id, user_id]
      );
    } else {
      await promisePool.query(
        `INSERT INTO favorites (anime_id, user_id, status) VALUES (?, ?, ?)`,
        [anime_id, user_id, status]
      );
    }
    return NextResponse.json({ ok: true, action: "added" });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { anime_id, user_id } = body;
    const promisePool = mysqlPool.promise();
    await promisePool.query(
      `DELETE FROM favorites WHERE anime_id = ? AND user_id = ?`,
      [anime_id, user_id]
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}