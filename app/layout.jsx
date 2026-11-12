import './global.css';

export const metadata = {
  title: 'TabNews — Em Construção',
  description:
    'Estamos reconstruindo o TabNews, um lugar na internet para conteúdos de tecnologia com valor concreto.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
