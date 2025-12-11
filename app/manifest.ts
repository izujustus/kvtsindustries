import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KVTS Industries ERP',
    short_name: 'KVTS ERP',
    description: 'Comprehensive Enterprise Resource Planning System for KVTS Industries.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#E30613',
    icons: [
      {
        src: '/logo.png', // We use your existing logo
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}