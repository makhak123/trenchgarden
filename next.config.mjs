/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static generation for garden page
  trailingSlash: false,
  generateBuildId: async () => {
    return 'trench-garden-build'
  },
  transpilePackages: [
    '@react-three/fiber', 
    '@react-three/drei', 
    'three',
    'framer-motion',
    'zustand'
  ],
  images: {
    domains: ['blob.v0.dev'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    esmExternals: false,
    // Disable static optimization for pages with 3D content
    forceSwcTransforms: false,
  },
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { isServer, dev }) => {
    // Completely disable eval-based source maps
    config.devtool = false
    
    // Add support for 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    })
    
    // Add support for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    })
    
    // Server-side fallbacks
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        encoding: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      }
    } else {
      // Client-side fallbacks
      config.resolve.fallback = {
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
        assert: false,
        http: false,
        https: false,
        url: false,
        zlib: false,
      }
    }
    
    // Disable all optimization that might cause issues
    config.optimization = {
      ...config.optimization,
      minimize: false,
      splitChunks: false,
      usedExports: false,
      sideEffects: false,
    }
    
    // Fix module resolution
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    })
    
    return config
  },
  // Strict CSP without eval
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' blob: data:; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: data: https:; worker-src 'self' blob:; object-src 'none';",
          },
        ],
      },
    ]
  },
  // Force dynamic rendering for garden page
  async generateStaticParams() {
    return []
  },
}

export default nextConfig
