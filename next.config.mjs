/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: [
    '@react-three/fiber', 
    '@react-three/drei', 
    '@react-three/postprocessing',
    'lucide-react',
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
    esmExternals: 'loose',
  },
  // Fix for production builds
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  webpack: (config, { isServer, dev }) => {
    // Add support for 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    
    // Add support for font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[name].[hash][ext]',
      },
    });
    
    // Better fallbacks for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
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
      };
    }
    
    // Fix for framer-motion and other modules
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    // Prevent problematic optimizations that cause undefined errors
    config.optimization = {
      ...config.optimization,
      providedExports: false,
      usedExports: false,
      sideEffects: false,
    };
    
    // CRITICAL: Fix webpack optimization that causes 'S' undefined errors
    config.optimization = {
      ...config.optimization,
      // Disable problematic optimizations
      providedExports: false,
      usedExports: false,
      sideEffects: false,
      // Fix mangling that causes property access issues
      minimize: !dev,
      minimizer: !dev ? [
        '...',
        // Add custom terser options to prevent property mangling
        new (require('terser-webpack-plugin'))({
          terserOptions: {
            mangle: {
              properties: false, // Don't mangle property names
            },
            compress: {
              drop_console: false,
              drop_debugger: false,
            },
          },
        }),
      ] : [],
      // Prevent code splitting issues that cause undefined references
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks?.cacheGroups,
          default: false,
          vendors: false,
          // Create stable chunks
          three: {
            name: 'three',
            chunks: 'all',
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            priority: 20,
            enforce: true,
          },
          motion: {
            name: 'motion',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
            priority: 20,
            enforce: true,
          },
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            priority: 10,
            enforce: true,
          },
        },
      },
    };
    
    // Add resolve extensions to prevent module resolution issues
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs'];
    
    // Fix module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure consistent three.js resolution
      'three': require.resolve('three'),
      // Fix framer-motion resolution
      'framer-motion': require.resolve('framer-motion'),
    };
    
    return config;
  },
  // Enhanced headers to fix CSP and other issues
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data: 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data:; connect-src 'self' blob: data: https:; worker-src 'self' blob:; object-src 'none';",
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
}

export default nextConfig;
