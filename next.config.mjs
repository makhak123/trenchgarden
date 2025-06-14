/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode for better Three.js compatibility
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Add all problematic packages to transpilePackages
  transpilePackages: [
    '@react-three/fiber', 
    '@react-three/drei', 
    '@react-three/postprocessing',
    'lucide-react',
    'three'
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
  // Add CSP headers for better compatibility
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self' blob: data:; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: data:; style-src 'self' 'unsafe-inline' blob: data:; img-src 'self' data: blob: https: http:; font-src 'self' data: blob:; connect-src 'self' blob: data: https: wss: ws:; worker-src 'self' blob: data:; child-src 'self' blob: data:; frame-src 'self' blob: data:; media-src 'self' blob: data:; object-src 'none';"
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    // Add support for 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    });
    
    // Fix for "Cannot read properties of undefined" errors
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      os: false,
    };
    
    // Ensure Three.js is available globally in the browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'three': 'three',
      };
    }
    
    return config;
  },
}

export default nextConfig;
