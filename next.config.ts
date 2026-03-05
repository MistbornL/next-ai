import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['pdfjs-dist'],
  images: { remotePatterns: [
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'ctys0alizqllquq3.public.blob.vercel-storage.com' },
    ]}
};

export default nextConfig;