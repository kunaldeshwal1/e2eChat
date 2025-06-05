import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
const protectedRoutes = [
  "/dashboard",
  "/users",
  "/chat",
  "/privatechat",
  "/mycontacts",
];
const publicRoutes = ["/login", "/signup", "/"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .map(([key, ...value]) => [key, value.join("=")])
  );
  console.log("this are cookies from middleware", cookies);
  console.log("cookies headers", cookieHeader);
  const session = cookies["session"];

  if (!session && isProtectedRoute) {
    // For example, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Continue with request
  return NextResponse.next();
}

// export default async function middleware(req: NextRequest) {
//   const path = req.nextUrl.pathname;
//   const isProtectedRoute = protectedRoutes.includes(path);
//   const isPublicRoute = publicRoutes.includes(path);

//   const cookieStore = await cookies();
//   const session = cookieStore.get("session");
//   console.log("This is cookieStore", cookieStore);
//   console.log("this is seesion from client middleware", session);
//   // if (isProtectedRoute && !session) {
//   //   return NextResponse.redirect(new URL("/login", req.nextUrl));
//   // }

//   if (
//     isPublicRoute &&
//     session &&
//     !req.nextUrl.pathname.startsWith("/dashboard")
//   ) {
//     return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
//   }

//   return NextResponse.next();
// }
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
