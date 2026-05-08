// Comments API for a specific anime
// GET - fetch all comments for anime, joined with username and profileimage
// POST - post new comment with user_id and comment_text
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

//get username + comments
export async function GET(_request, { params }) {
  const { anime_id } = await params;
  const promisePool = mysqlPool.promise();
  const [rows] = await promisePool.query(
    `SELECT comments.*, users.username 
    FROM comments 
    JOIN users ON comments.user_id = users.id
    WHERE comments.anime_id = ?`, [anime_id]
    );
  return NextResponse.json(rows);
}

export async function POST(request, { params }) {
  try {
    const { anime_id } = await params;
    const body = await request.json();
    const { comment_text, user_id } = body;
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(
      `INSERT INTO comments (anime_id, user_id, comment_text) VALUES (?, ?, ?)`,
      [anime_id, user_id, comment_text]
    );
    const [rows] = await promisePool.query(
        `SELECT comments.*, users.username , users.profileimage
        FROM comments 
        JOIN users ON comments.user_id = users.id
        WHERE comments.id = ?`, [result.insertId]
        );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}