/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    images: {
        dangerouslyAllowSVG: true,
        remotePatterns: [
            {
                protocol: "https",
                hostname: "via.placeholder.com",
            },
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
                protocol: "http",
                hostname: process.env.MINIO_PUBLIC_IP,
                port: "9000",
                pathname: "/salesense-bucket/**",
            },
        ],
    },
};

export default nextConfig;
