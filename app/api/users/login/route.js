// Login API
// POST - checks username + password match in database
// Returns user object if found, 401 if not
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

// POST /api/user -> Check user exist or not
export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password_hash } = body;
    const promisePool = mysqlPool.promise();
    const [rows] = await promisePool.query(
      `SELECT * FROM users WHERE username = ? AND password_hash = ?`,
      [username, password_hash]
    );
    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }
    return NextResponse.json(rows[0]);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}