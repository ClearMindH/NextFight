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
      {
        protocol: 'https',
        hostname: 'ufc.com',
      },
      {
        protocol: 'https',
        hostname: 'www.ufc.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.nextfightsstats.com' }],
        destination: 'https://nextfightsstats.com/:path*',
        permanent: true,
      },
      { source: '/dashboard', destination: '/', permanent: true },
      { source: '/dashboard/:path*', destination: '/', permanent: true },
      { source: '/billing', destination: '/account', permanent: true },
      { source: '/legal', destination: '/mentions-legales', permanent: true },
      { source: '/predictions', destination: '/ufc-pronostics', permanent: true },
      { source: '/events', destination: '/#events', permanent: true },
      { source: '/fighters', destination: '/', permanent: true },
      { source: '/compare', destination: '/', permanent: true },
      { source: '/history', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig
