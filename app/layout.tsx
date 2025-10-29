import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sitemap Meta Generator",
  description: "Generate SEO-optimized Japanese meta tags from XML sitemaps",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
