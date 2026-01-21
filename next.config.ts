import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression
  compress: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(js|css)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
  },

  // Allow cross-origin requests from local network IPs in development
  // Note: Create .env.local with HOSTNAME=0.0.0.0 to listen on all interfaces
  // This allows access from any LAN IP address
  allowedDevOrigins: process.env.NODE_ENV === 'development'
    ? (() => {
      const port = process.env.PORT || process.env.NEXT_PUBLIC_PORT || '3030';
      const origins = [
        // Standard localhost origins
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
        // LAN IP with port (when accessing via http://10.0.0.172:3030)
        `http://10.0.0.172:${port}`,
        // LAN IP without port (when browser omits port in origin header)
        'http://10.0.0.172',
        // Also include without port for localhost (fallback)
        'http://localhost',
        'http://127.0.0.1',
      ];
      // Remove duplicates
      return [...new Set(origins)];
    })()
    : [],
};

export default nextConfig;
