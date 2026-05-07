// Tags API
// POST - add a new tag to an anime
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

//POST/api/tags

export async function POST(request) {
    try {
        const body = await request.json();
        //return NextResponse.json(body);
        const { anime_id, tag_name } = body;
        const promisePool = mysqlPool.promise();
        const [result] = await promisePool.query(
            `INSERT INTO tags (anime_id, tag_name) VALUES (?,?)`,
            [anime_id, tag_name]

        )

        const [rows] = await promisePool.query(
          `SELECT * FROM tags WHERE id = ?`,
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


