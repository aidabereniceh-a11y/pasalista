import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const basicAuth = request.headers.get("authorization");

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.ADMIN_USER &&
      pwd === process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Acceso no autorizado", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Acceso restringido"',
    },
  });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};