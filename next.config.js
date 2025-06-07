/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracing: false,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig 