export const generateSKU = (name: string, prefix = "ITEM"): string => {
    // Take first 3 letters of name or default prefix
    const shortName =
        name.slice(0, 3).toUpperCase().replace(/\s+/g, "") || prefix;

    // Use a shorter random string (timestamp is okay, but randomBytes is shorter/safer)
    const uniquePart = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Result: "APP-X7Z2P1" (Much easier to print and scan than the full name)
    return `${shortName}-${uniquePart}`;
};
