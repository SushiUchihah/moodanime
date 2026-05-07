import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function DELETE(_request, { params }) {
  try {
    const { anime_id } = await params;
    const promisePool = mysqlPool.promise();
    await promisePool.query(`DELETE FROM tags WHERE anime_id = ?`, [anime_id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}