import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = ["/dashboard"];

export default async function proxy(request: NextRequest) {
	const pathName = request.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) => pathName.startsWith(route));
	
	if (isProtectedRoute) {
		const res = await fetch(new URL("/api/auth/get-session", request.url), {
			headers: {
				cookie: request.headers.get("cookie") || "",
			},
		});

		if (!res.ok) {
			return NextResponse.redirect(new URL("/sign-in", request.url));
		}
        
        const session = await res.json();
        if (!session) {
            return NextResponse.redirect(new URL("/sign-in", request.url));
        }
	}
	
	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
