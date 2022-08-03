/** @type {import('next').NextConfig} */
const { patchWebpackConfig } = require('next-global-css')

const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['pages', 'utils', 'lib', 'components', 'atoms', '__tests__', 'scripts']
  },
  webpack5: true,
  webpack: (config, options) => {
    patchWebpackConfig(config, options)
    config.resolve.fallback = { fs: false };

    return config;
  }
};

module.exports = nextConfig;
