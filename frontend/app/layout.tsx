import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'LibreM - E-commerce & CRM',
  description: 'Plataforma de e-commerce con CRM integrado',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
