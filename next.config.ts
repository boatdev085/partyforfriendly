import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["cdn.discordapp.com", "avatars.githubusercontent.com"],
  },
};

export default nextConfig;
