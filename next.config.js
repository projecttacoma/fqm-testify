/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['domhandler', 'domelementtype', 'htmlparser2', 'domutils', 'dom-serializer', 'entities', 'uuid'],
  turbopack: {
    resolveAlias: {
      fs: {
        browser: './empty.ts'
      }
    }
  },
  webpack: config => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false };

    return config;
  }
};

module.exports = nextConfig;
