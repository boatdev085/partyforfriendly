import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint errors in pre-existing files don't block the build
    ignoreDuringBuilds: true,
  },
  compiler: {
    styledComponents: true,
  },
  images: {
    domains: ["cdn.discordapp.com", "avatars.githubusercontent.com"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://partner.googleadservices.com https://tpc.googlesyndication.com",
              "frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com",
              "img-src 'self' data: https: blob:",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
