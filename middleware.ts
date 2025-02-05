import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPrivateRoute = createRouteMatcher([
    "/dashboard(.*)",
    "/products(.*)",
    "/invoice(.*)",
    "/invoices(.*)",
    "/customer(.*)",
]);

const isAuthPage = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
    if (isPrivateRoute(request)) {
        await auth.protect();
    }

    const { userId } = await auth();

    if (userId && isAuthPage(request)) {
        // Redirect authenticated users away from sign-in and sign-up pages
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/dashboard",
            },
        });
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
