/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@impact/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
