/** @type {import('next').NextConfig} */
const nextConfig = {
  // Für Docker Standalone Build
  output: 'standalone',
  
  // Experimentelle Features
  experimental: {
    // Für bessere Performance in Docker
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
  
  // Webpack Konfiguration
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Prisma Client für Server-Side Rendering
      config.externals.push('@prisma/client')
    }
    return config
  },
  
  // Umgebungsvariablen
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Für bessere Docker Performance
  swcMinify: true,
  
  // Bilder Konfiguration
  images: {
    domains: ['localhost'],
    unoptimized: process.env.NODE_ENV === 'development'
  }
}

module.exports = nextConfig