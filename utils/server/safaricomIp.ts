import type { NextApiRequest, NextApiResponse } from "next";

// Known Safaricom Daraja callback source IPs.
const SAFARICOM_IPS = [
    "196.201.214.200",
    "196.201.214.206",
    "196.201.213.114",
    "196.201.214.207",
    "196.201.214.208",
    "196.201.213.44",
    "196.201.212.127",
    "196.201.212.138",
    "196.201.212.129",
    "196.201.212.136",
    "196.201.212.74",
    "196.201.212.69",
];

/**
 * Resolves the real client IP for a request behind a single trusted proxy.
 *
 * `x-forwarded-for` is `client, proxy1, proxy2, ...` — an external attacker can
 * only PREPEND on the left, so the right-most entry is the address the trusted
 * proxy actually observed. Using the left-most value (as the old code did) lets
 * anyone spoof an allowlisted IP. We therefore read the right-most hop.
 *
 * ponytail: assumes exactly one trusted proxy in front of the app. If more are
 * added, make the trusted-hop count configurable via env.
 */
function getClientIp(req: NextApiRequest): string {
    const xff = req.headers["x-forwarded-for"];
    if (xff) {
        const parts = (Array.isArray(xff) ? xff.join(",") : xff)
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
        if (parts.length > 0) {
            return parts[parts.length - 1];
        }
    }
    return (req.socket.remoteAddress || "").trim();
}

/**
 * Verifies a request originates from Safaricom. Returns true when allowed.
 * On rejection it writes a 403 (in production) and returns false, so callers
 * can simply `if (!verifySafaricomSource(req, res)) return;`.
 *
 * These endpoints have no other authentication (Daraja does not sign callbacks),
 * so IP allowlisting is the only gate — it must not be bypassable.
 */
export function verifySafaricomSource(
    req: NextApiRequest,
    res: NextApiResponse,
): boolean {
    const clientIp = getClientIp(req);
    if (SAFARICOM_IPS.includes(clientIp)) {
        return true;
    }

    console.warn(
        `SECURITY: Safaricom endpoint hit from unauthorized IP: ${clientIp}`,
    );

    // Allow through in non-production so local/tunnelled testing still works.
    if (process.env.NODE_ENV !== "production") {
        return true;
    }

    res.status(403).json({ error: "Unauthorized source" });
    return false;
}
