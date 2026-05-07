import { NextResponse } from "next/server";
import { mysqlPool } from "@/utils/db";

export async function PUT(_request, { params }) {
  const { id } = await params;
  const promisePool = mysqlPool.promise();
  await promisePool.query(`UPDATE anime SET approved = 1 WHERE id = ?`, [id]);
  return NextResponse.json({ ok: true });
}