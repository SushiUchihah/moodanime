// Characters API
// POST - add a new character to an anime
import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

//POST/api/characters

export async function POST(request) {
    try {
        const body = await request.json();
        //return NextResponse.json(body);
        const { anime_id, name, role, description, image } = body;
        const promisePool = mysqlPool.promise();
        const [result] = await promisePool.query(
            `INSERT INTO characters (anime_id, name, role, description, image) VALUES (?,?,?,?,?)`,
            [anime_id, name, role, description, image]

        )

        const [rows] = await promisePool.query(
          `SELECT * FROM characters WHERE id = ?`,
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
