import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");

const { error } = await supabase.storage.getBucket("salesense-bucket");

if (error && error.message !== "The resource was not found") {
    const { error: createError } = await supabase.storage.createBucket(
        "salesense-bucket",
        {
            public: true,
            fileSizeLimit: 5 * 1024 * 1024, // 5 MB
        }
    );
    if (createError) {
        throw new Error(
            "Error creating Supabase bucket:" + createError.message
        );
    }
}
