import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function session(request: NextRequest) {
  let cookie = request.cookies.get("session")?.value;
  return cookie;
}
