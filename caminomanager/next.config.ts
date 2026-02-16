import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirects individuales de slugs en inglés a español
      { source: '/protected/countries', destination: '/paises', permanent: true },
      { source: '/protected/cities', destination: '/ciudades', permanent: true },
      { source: '/protected/zones', destination: '/zonas', permanent: true },
      { source: '/protected/dioceses', destination: '/diocesis', permanent: true },
      { source: '/protected/parishes', destination: '/parroquias', permanent: true },
      { source: '/protected/parishes/:id', destination: '/parroquias/:id', permanent: true },
      { source: '/protected/stepways', destination: '/etapas', permanent: true },
      { source: '/protected/teamtypes', destination: '/tipos-equipo', permanent: true },
      { source: '/protected/people', destination: '/personas', permanent: true },
      { source: '/protected/communities', destination: '/comunidades', permanent: true },
      { source: '/protected/communities/:id', destination: '/comunidades/:id', permanent: true },
      { source: '/protected/national-team', destination: '/equipo-nacional', permanent: true },
      { source: '/protected/reports', destination: '/reportes', permanent: true },
      { source: '/protected/reports/catechist-teams', destination: '/reportes/equipos-catequistas', permanent: true },
      { source: '/protected/reports/priests', destination: '/reportes/presbiteros', permanent: true },
      { source: '/protected/reports/step-status', destination: '/reportes/estado-pasos', permanent: true },
      { source: '/protected/reports/community-leaders', destination: '/reportes/lideres-comunidades', permanent: true },
      { source: '/protected/account', destination: '/cuenta', permanent: true },
      { source: '/protected/departamentos', destination: '/departamentos', permanent: true },
      { source: '/protected/admin', destination: '/admin', permanent: true },
      { source: '/public', destination: '/publico', permanent: true },
      // Catch-all para cualquier otra ruta /protected/ no listada arriba
      { source: '/protected/:path*', destination: '/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
