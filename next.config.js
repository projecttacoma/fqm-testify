/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'utils', 'lib', 'components', 'atoms', '__tests__']
  }
};

module.exports = nextConfig;
