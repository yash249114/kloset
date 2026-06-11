import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-javascript/blob/master/packages/nextjs/src/config/types.ts

  // Suppresses source map uploading logs during silencing builds
  silent: true,
  org: "kloset",
  project: "kloset-frontend",

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Delete source maps after upload to hide them from visitors
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  // Automatically instrument Vercel Cron jobs
  automaticVercelMonitors: true,
});
