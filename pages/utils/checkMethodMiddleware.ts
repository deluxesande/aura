import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";

/**
 * Middleware to check if the request method is allowed.
 *
 * @param handler The NextApiHandler to wrap.
 * @param allowedMethods Array of allowed HTTP methods.
 * @returns The wrapped handler with method checking.
 */
const checkMethodMiddleware =
    (handler: NextApiHandler, allowedMethods: string[]) =>
    async (req: NextApiRequest, res: NextApiResponse) => {
        if (!allowedMethods.includes(req.method as string)) {
            res.setHeader("Allow", allowedMethods);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            return;
        }
        await handler(req, res);
    };

export default checkMethodMiddleware;
