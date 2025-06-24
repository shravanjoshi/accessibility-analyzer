/** @type {import('next').NextConfig} */

const nextConfig = {
  serverExternalPackages: ['lighthouse', 'chrome-launcher', 'puppeteer'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude lighthouse from client-side bundle
      config.externals = [...(config.externals || []), 'lighthouse', 'chrome-launcher'];
    }
    return config;
  },
}

export default nextConfig;
