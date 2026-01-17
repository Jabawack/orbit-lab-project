import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'orbit-lab-project | 3D Globe Visualization',
  description:
    'A reusable 3D globe visualization framework built with React Three Fiber and three-globe. Real-time flight tracking, satellite visualization, and more.',
  keywords: ['Three.js', 'React Three Fiber', 'globe', 'visualization', 'flight tracker', 'WebGL'],
  authors: [{ name: 'jabawack' }],
  openGraph: {
    title: 'orbit-lab-project | 3D Globe Visualization',
    description: 'Real-time 3D globe visualization framework',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
