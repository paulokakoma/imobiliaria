/** @type {import('next').NextConfig} */
const nextConfig = {
  // MUDANÇA: Adicionada a configuração para desativar todos os indicadores de desenvolvimento.
  // Isto irá remover o ícone do Next.js que aparece no canto da tela.
  devIndicators: false,

  async headers() {
    return [
      {
        // Aplica-se a todos os recursos internos do Next.js em desenvolvimento
        source: '/_next/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // Permite qualquer origem, seguro para desenvolvimento local
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
