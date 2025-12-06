const MINIO_IP = process.env.MINIO_PUBLIC_IP || "localhost";

/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: true,
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: "http",
                hostname: "localhost",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
            {
                protocol: "https",
                hostname: "randomuser.me",
            },
            {
                protocol: "https",
                hostname: "www.svgrepo.com",
            },
            {
                protocol: "https",
                hostname: "img.clerk.com",
            },
            {
                protocol: "http",
                hostname: MINIO_IP,
                port: "9000",
                pathname: "/salesense-bucket/**",
            },
            {
                protocol: "https",
                hostname: "zvtwhlkghglvxeaaemkk.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
};

export default nextConfig;
