import { masterPrisma } from "./prisma";

export const prisma = masterPrisma;

// For backward compatibility, keep the same export name
export default prisma;
