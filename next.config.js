/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracing: false, // moved out of experimental
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

module.exports = nextConfig;
