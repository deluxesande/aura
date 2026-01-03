import { createRouteHandler } from "uploadthing/next-legacy";
import { ourFileRouter } from "@/utils/server/uploadthing";

export default createRouteHandler({
    router: ourFileRouter,
});
