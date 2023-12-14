// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   swcMinify: false,
//   images: {
//     domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com']
//   },
//   eslint: {
//     ignoreDuringBuilds: true
//   },

//   images: {
//     domains: [
//       'source.boringavatars.com',
//       'encrypted-tbn0.gstatic.com',
//       'lh3.googleusercontent.com',
//       'firebasestorage.googleapis.com'
//     ]
//   },

// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: false, // Disable minification as recommended by Web3Modal
  images: {
    domains: [
      'ouch-cdn2.icons8.com',
      'source.boringavatars.com',
      'encrypted-tbn0.gstatic.com',
      'lh3.googleusercontent.com',
      'firebasestorage.googleapis.com'
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  webpack: (config) => {
    // Add externals that are not to be included in the webpack bundle
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  typescript: {
    ignoreBuildErrors: true
  }
};

module.exports = nextConfig;
