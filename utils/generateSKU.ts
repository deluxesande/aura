export const generateSKU = (name: string): string => {
    const uniquePart = Date.now().toString(36); // Generates a unique part based on the current timestamp
    const namePart = name.replace(/\s+/g, '-').toUpperCase(); // Converts name to uppercase and replaces spaces with hyphens
    return `${namePart}-${uniquePart}`;
};