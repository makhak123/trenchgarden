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
  },
  swcMinify: false, // Disable to avoid eval issues
  compiler: {
    removeConsole: false, // Keep console for debugging
  },
  webpack: (config, { isServer, dev }) => {
    // Disable eval-based source maps completely
    if (!isServer) {
      config.devtool = false;
    }
    
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
    
    // Disable optimization that might use eval
    config.optimization = {
      ...config.optimization,
      minimize: false, // Disable minification to avoid eval
      splitChunks: false, // Disable code splitting to avoid eval
    };
    
    // Ensure no eval is used anywhere
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });
    
    return config;
  },
  // Strict CSP with NO eval
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
    ];
  },
}

export default nextConfig;
