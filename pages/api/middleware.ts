import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { getAuth } from "@clerk/nextjs/server";
import bodyParser from "body-parser";

export const addCreatedBy = (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // 1. Immediately bypass body mutation for GET/DELETE requests
        if (req.method === "GET" || req.method === "DELETE") {
            return handler(req, res);
        }

        // 2. Parse the request body for POST/PUT requests
        if (!req.body) {
            await new Promise<void>((resolve, reject) => {
                bodyParser.json()(req, res, (err) => {
                    if (err) return reject(err);
                    resolve();
                });
            });
        }

        try {
            const user = getAuth(req);
            if (user && user.userId) {
                // 3. Ensure req.body is an object before assigning to it
                req.body = req.body || {};
                req.body.createdBy = user.userId;
            }
            return handler(req, res);
        } catch (error) {
            res.status(500).json({ error: "Failed to add createdBy field" });
        }
    };
};
