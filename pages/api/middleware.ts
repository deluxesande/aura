import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { getAuth } from "@clerk/nextjs/server";
import bodyParser from "body-parser";

export const addCreatedBy = (handler: NextApiHandler) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        // Check if the body has already been parsed
        if (!req.body) {
            // Parse the request body
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
                req.body.createdBy = user.userId;
            }
            return handler(req, res);
        } catch (error) {
            res.status(500).json({ error: "Failed to add createdBy field" });
        }
    };
};
