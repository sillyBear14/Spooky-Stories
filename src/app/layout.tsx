import type { Metadata } from "next";
import { Inter, Creepster } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-sans" 
});

const creepster = Creepster({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-creepster'
});

export const metadata: Metadata = {
  title: "Spooky Stories",
  description: "Share your spine-chilling tales with fellow horror enthusiasts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`dark ${creepster.variable}`} suppressHydrationWarning>
      <body className={`min-h-screen bg-background font-sans antialiased ${inter.variable}`}>
        <div className="spooky-background" />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
