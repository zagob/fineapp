import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimizações de performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Otimizações de imagens
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
  },
  
  // Compressão
  compress: true,
};

export default nextConfig;
