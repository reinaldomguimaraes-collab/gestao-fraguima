import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const PUBLIC_PATHS = ["/login", "/definir-senha", "/aceite-termos"];

function withPathname(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-pathname", req.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export default auth((req) => {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return withPathname(req);

  const user = req.auth?.user as any;
  if (!req.auth || !user) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }

  const isAdminArea = pathname.startsWith("/administrativo");
  const isEquipeArea = pathname.startsWith("/administrativo/equipe");

  // Só a equipe interna (Proprietário/Colaborador) entra no Administrativo.
  if (isAdminArea && user.userType !== "interno") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Só o Proprietário gerencia a aba Equipe.
  if (isEquipeArea && user.papel !== "PROPRIETARIO") {
    return NextResponse.redirect(new URL("/administrativo", req.url));
  }
  // A equipe interna não usa o painel do cliente.
  if (!isAdminArea && user.userType === "interno") {
    return NextResponse.redirect(new URL("/administrativo", req.url));
  }

  return withPathname(req);
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
};
