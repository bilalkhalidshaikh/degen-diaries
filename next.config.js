/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false,
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com']
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true // Add this line to ignore TypeScript errors during build
  },
  images: {
    domains: [
      'source.boringavatars.com',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com'
    ]
  }
};

module.exports = nextConfig;
