/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'wallpapercave.com',
      },
    ],
  },
  async redirects() {
    return [
      { source: '/dashboard', destination: '/', permanent: true },
      { source: '/dashboard/:path*', destination: '/', permanent: true },
      { source: '/predictions', destination: '/ufc-pronostics', permanent: true },
      { source: '/events', destination: '/#events', permanent: true },
      { source: '/fighters', destination: '/', permanent: true },
      { source: '/compare', destination: '/', permanent: true },
      { source: '/history', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig
