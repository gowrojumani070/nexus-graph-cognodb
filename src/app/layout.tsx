import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NexusGraph — CognoDB Supply Chain & Vulnerability Blast Radius Engine',
  description: 'A graph database web application backed by CognoDB (openCypher over Bolt protocol) modeling software supply chains, microservices, cloud servers, and multi-hop vulnerability blast radius.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
