// API for users list
// GET - fetch all users with search, includes their comments and reactions
// POST - create new user (register)
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

/*CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);*/

export async function GET(req) {
  const { search } = Object.fromEntries(new URL(req.url).searchParams);
  const promisePool = mysqlPool.promise();
  let sql = "SELECT * FROM users";
  let params = [];


  if (search) {
    sql += " WHERE username LIKE ? OR email LIKE ?";       // This is to search base on username and email of the table
    params = [`%${search}%`, `%${search}%`];
  }
  
  const [usersRows] = await promisePool.query(sql, params);   // Fetch user
  const [commentsRows] = await promisePool.query("SELECT * FROM comments");   // Fetch comments for all users in one go
  const [reactsRows] =  await promisePool.query("SELECT * FROM reactions");  // Fetch reactions for all users in one go
  
  const result = usersRows.map(user => {   // Merge tags into each anime object
    const commentsOfUsers = commentsRows.filter(comment => comment.user_id === user.id);
    const reactionsOfUsers = reactsRows.filter(reactions => reactions.user_id === user.id);
    return { ...user, comments: commentsOfUsers, reactions: reactionsOfUsers };
  });
  return NextResponse.json(result);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, email, password_hash } = body;
    const promisePool = mysqlPool.promise();
    const [result] = await promisePool.query(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      [username, email, password_hash]
    );
    const [rows] = await promisePool.query(
      `SELECT * FROM users WHERE id = ?`, [result.insertId]
    );
    return NextResponse.json(rows[0], { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}