/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'utils', 'lib', 'components', 'atoms', '__tests__', 'scripts']
  },
  webpack: config => {
    config.resolve.fallback = { fs: false };

    return config;
  }
};

module.exports = nextConfig;
