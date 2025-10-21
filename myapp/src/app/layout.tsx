// app/layout.tsx
import type { Metadata } from 'next';
import Providers from './providers';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Escrow Dapp',
};

const globalStyles = `
  body { background-color: #121212; color: #eee; margin: 0; font-family: sans-serif; }
  main { padding: 1rem; }
  h1, h2 { border-bottom: 1px solid #444; padding-bottom: 0.5rem; }
  input { background-color: #222; color: #eee; border: 1px solid #444; padding: 0.5rem; border-radius: 4px; }
  button { background-color: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; }
  button:disabled { background-color: #555; }
  a { color: #007bff; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{globalStyles}</style>
      </head>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}