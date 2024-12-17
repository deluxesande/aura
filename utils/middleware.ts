import { IncomingMessage } from "http";

export const parseFormData = (
    req: IncomingMessage
): Promise<{ fields: any; files: any }> => {
    return new Promise((resolve, reject) => {
        const formData: any = { fields: {}, files: {} };
        let data = "";

        req.on("data", (chunk) => {
            data += chunk;
        });

        req.on("end", () => {
            console.log("Data received:", data);

            const boundary = req.headers["content-type"]?.split("boundary=")[1];
            if (!boundary) {
                return reject(
                    new Error("No boundary found in content-type header")
                );
            }

            const parts = data.split(`--${boundary}`);
            parts.forEach((part) => {
                if (part.includes("Content-Disposition")) {
                    const [header, body] = part.split("\r\n\r\n");
                    const nameMatch = header.match(/name="([^"]+)"/);
                    const filenameMatch = header.match(/filename="([^"]+)"/);

                    if (nameMatch) {
                        const name = nameMatch[1];
                        if (filenameMatch) {
                            const filename = filenameMatch[1];
                            const fileContent = body.trim().split("\r\n")[0];
                            formData.files[name] = {
                                filename,
                                content: Buffer.from(fileContent, "binary"),
                            };
                        } else {
                            formData.fields[name] = body
                                .trim()
                                .split("\r\n")[0];
                        }
                    }
                }
            });

            console.log("Parsed form data:", formData);
            resolve(formData);
        });

        req.on("error", (err) => {
            reject(err);
        });
    });
};
