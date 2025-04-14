/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add polyfills for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      os: false,
      path: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      buffer: require.resolve('buffer'),
    };

    return config;
  },
};

module.exports = nextConfig; 