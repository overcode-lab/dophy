import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ff7726",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "DOPHY — You Need Dopamine",
  description: "Link resmi DOPHY (Dopamine Snack) — Pesan Snack, daftar Creator Partner, & media sosial resmi.",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/assets/logo-transparent.png", type: "image/png" }],
    shortcut: "/assets/logo-transparent.png",
    apple: "/assets/logo-transparent.png",
  },
  openGraph: {
    title: "DOPHY — You Need Dopamine",
    description: "Snack Penambah Mood & Energi Harianmu 🍿✨",
    url: "https://dophy.com",
    siteName: "DOPHY Official",
    images: [
      {
        url: "/assets/logo-transparent.png",
        width: 800,
        height: 800,
        alt: "DOPHY Logo",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DOPHY — You Need Dopamine",
    description: "Snack Penambah Mood & Energi Harianmu 🍿✨",
    images: ["/assets/logo-transparent.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${jakarta.className}`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${jakarta.className} antialiased selection:bg-dophy-500 selection:text-white font-sans`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
