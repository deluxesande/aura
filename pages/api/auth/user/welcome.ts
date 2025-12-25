import { NextApiRequest, NextApiResponse } from "next";
import { Novu } from "@novu/api";
import { prisma } from "@/utils/lib/client";
import { getAuth } from "@clerk/nextjs/server";

const novu = new Novu({
    secretKey: process.env.NOVU_SECRET_KEY!,
});
export async function POST(request: NextApiRequest, response: NextApiResponse) {
    const { userId, email, firstName, lastName } = request.body;
    const user = getAuth(request);

    if (user) {
        try {
            await novu.trigger({
                to: {
                    subscriberId: user.userId!,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                },
                workflowId: "user-welcome-email",
                payload: {
                    firstName: firstName,
                    organizationName: "Salesense",
                },
            });

            return response.status(200).json({ success: true });
        } catch (error) {
            console.error("Novu Trigger Error:", error);
            return response.status(500).json({ success: false });
        }
    }
}
