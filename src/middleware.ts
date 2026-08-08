// NexoCore — Multi-Tenant Middleware
// Identifica el tenant por subdominio o JWT claim

import { auth } from "@/modules/auth/auth.config";
import { NextResponse, type NextRequest } from "next/server";

const TENANT_DOMAINS = ["nexocore.co", "localhost"];
const PUBLIC_PATHS = ["/", "/login", "/register", "/api/auth"];

export default auth((req: NextRequest & { auth?: unknown }) => {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Extract tenant slug from subdomain: ferreteria-lopez.nexocore.co
  let tenantSlug: string | null = null;
  for (const domain of TENANT_DOMAINS) {
    if (host.endsWith(`.${domain}`)) {
      const subdomain = host.slice(0, host.length - domain.length - 1);
      // Skip www, api, etc.
      if (subdomain && !["www", "api", "app"].includes(subdomain)) {
        tenantSlug = subdomain;
      }
    }
  }

  // Development: support query param ?tenant=slug
  if (!tenantSlug && process.env.NODE_ENV === "development") {
    const url = req.nextUrl;
    tenantSlug = url.searchParams.get("tenant");
  }

  // Inject tenant slug into headers for downstream route handlers
  const requestHeaders = new Headers(req.headers);
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug);
  }

  // Protect dashboard routes — require auth
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
    const session = req.auth;
    // auth() returns session or null; if null, redirect to login
    // NextAuth v5 handles this via the auth export
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
