export const siteConfig = {
  name: "Spooky Stories",
  description: "Share your spine-chilling tales with fellow horror enthusiasts",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/og-image.jpg",
  keywords: [
    "horror stories",
    "ghost stories",
    "spooky tales",
    "horror writing",
    "paranormal stories"
  ],
  authors: [
    {
      name: "Spooky Stories Community",
    },
  ],
}

export type SiteConfig = typeof siteConfig 