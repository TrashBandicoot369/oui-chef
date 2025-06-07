/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'public/images/optimized/**/*',
      ],
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
}

module.exports = nextConfig 