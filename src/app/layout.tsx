import type { Metadata } from "next";
import { Inter, Creepster } from "next/font/google";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";
import { siteConfig } from "@/config/site";

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
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: siteConfig.authors,
  openGraph: {
    title: `${siteConfig.name} - Share Your Haunting Tales`,
    description: "Join our community of horror enthusiasts and share your spine-chilling stories. Read, write, and experience the thrill of horror storytelling.",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - Where Nightmares Come Alive`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Share Your Haunting Tales`,
    description: "Join our community of horror enthusiasts and share your spine-chilling stories.",
    images: [siteConfig.ogImage],
  },
  metadataBase: new URL(siteConfig.url),
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
