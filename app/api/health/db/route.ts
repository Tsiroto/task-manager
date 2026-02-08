import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const readyState = mongoose.connection.readyState;
    return NextResponse.json({
      ok: true,
      readyState,
      name: mongoose.connection.name,
      host: mongoose.connection.host,
    });
  } catch (err) {
    console.error("[db health] error", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
