/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/admin/:path*', headers: [
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Referrer-Policy', value: 'same-origin' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Cache-Control', value: 'private, no-store' },
    ] }]
  },
}

export default nextConfig
