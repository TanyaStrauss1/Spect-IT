const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@spect-it/ui', '@spect-it/cv', '@spect-it/models'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
  images: {
    domains: ['localhost', 'www.spect-it.com'],
  },
  experimental: {
    optimizePackageImports: ['@spect-it/ui'],
  },
}

module.exports = nextConfig

