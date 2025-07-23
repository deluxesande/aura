import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// Get invitations for a business
export async function GET(request: NextRequest) {
    try {
        const { userId } = getAuth(request);
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { clerkId: userId },
        });

        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);
        const businessId = searchParams.get("businessId");

        if (!businessId) {
            return NextResponse.json(
                { error: "Business ID required" },
                { status: 400 }
            );
        }

        // Check if user has access to this business
        if (currentUser.businessId !== businessId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const invitations = await prisma.userInvitation.findMany({
            where: { businessId },
            include: {
                Business: {
                    select: { name: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json({ invitations });
    } catch (error) {
        console.error("Get invitations error:", error);
        return NextResponse.json(
            {
                error: "Internal server error",
            },
            { status: 500 }
        );
    }
}
