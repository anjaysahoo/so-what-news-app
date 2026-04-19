import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Simple, pragmatic email regex — HTML5 handles the strict-ish check on the client.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "invalid_email" },
      { status: 400 }
    );
  }

  const email =
    typeof body === "object" && body !== null && "email" in body
      ? String((body as { email: unknown }).email ?? "").trim().toLowerCase()
      : "";

  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, code: "invalid_email" },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.from("waitlist").insert({ email });

  if (error) {
    // Postgres unique_violation code
    if (error.code === "23505") {
      return NextResponse.json(
        { ok: false, code: "already_joined" },
        { status: 409 }
      );
    }
    console.error("waitlist insert failed", error);
    return NextResponse.json(
      { ok: false, code: "server_error" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
