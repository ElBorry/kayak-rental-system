import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb-setup";

export async function GET() {
  try {
    const client = await clientPromise;
    await client.db().command({ ping: 1 });
    return NextResponse.json({ status: "✅ Conectado a MongoDB 🎉" });
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    return NextResponse.json({ status: "❌ Error conectando a MongoDB", error });
  }
}
