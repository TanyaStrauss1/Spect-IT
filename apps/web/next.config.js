/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@spect-it/ui', '@spect-it/cv', '@spect-it/models'],
  images: {
    domains: ['localhost', 'www.spect-it.com'],
  },
  experimental: {
    optimizePackageImports: ['@spect-it/ui'],
  },
}

module.exports = nextConfig

