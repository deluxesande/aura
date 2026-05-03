import { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "../../../prisma/generated/tenant";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { url } = req.body;

        if (!url) {
            return res.status(400).json({ error: "Database URL is required" });
        }

        // Attempt to connect using the tenant Prisma client
        const tempClient = new PrismaClient({
            datasourceUrl: url,
        });

        try {
            await tempClient.$connect();
            await tempClient.$disconnect();
            
            // Push the tenant schema to their BYO database to create the necessary tables
            console.log("Connection successful. Pushing tenant schema to BYO database...");
            try {
                const { stdout, stderr } = await execAsync("npx prisma db push --schema=./prisma/schema.tenant.prisma --accept-data-loss", {
                    env: { ...process.env, DATABASE_URL: url }
                });
                console.log("Schema push output:", stdout);
                if (stderr) console.error("Schema push stderr:", stderr);
            } catch (execError: any) {
                console.error("Failed to push schema:", execError);
                return res.status(500).json({
                    success: false,
                    error: "Connected to database, but failed to initialize tables. Check permissions."
                });
            }

            return res.status(200).json({ success: true, message: "Connection successful and tables initialized." });
        } catch (dbError: any) {
            console.error("DB Connection Test Failed:", dbError);
            return res.status(400).json({ 
                success: false, 
                error: "Failed to connect to the provided database. Please check the URL and ensure it's accessible." 
            });
        }
    } catch (error) {
        console.error("Test Connection Error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

