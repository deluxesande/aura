import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const isPrivateRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/products(.*)",
    "/invoice(.*)",
    "/invoices(.*)",
    "/customer(.*)",
    "/profile(.*)",
    "/settings(.*)",
]);

// const isPrivateRoute = createRouteMatcher([]);

// const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    // Block __nextjs_original-stack-frames requests
    if (request.nextUrl.pathname === "/__nextjs_original-stack-frames") {
        return new NextResponse("Not Found", { status: 404 });
    }

    if (isPrivateRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
