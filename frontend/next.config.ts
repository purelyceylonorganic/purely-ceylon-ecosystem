import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // 🌐 இந்த மாஸ் லாக் உலகத்தில் உள்ள அனைத்து வெப்சைட் படங்களையும் அனுமதிக்கும்!
      },
    ],
  },
};

export default nextConfig;