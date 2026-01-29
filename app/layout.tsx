import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://half.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "HALF - 밸런스 게임 | 50:50 균형의 논쟁 엔진",
    template: "%s | HALF"
  },
  description: "50:50 균형의 논쟁 엔진. 사소하지만 팽팽한 일상의 딜레마에 투표하고, 다른 사람들의 의견을 확인하세요.",
  keywords: ["밸런스 게임", "투표", "논쟁", "의견", "선택", "딜레마", "balance game", "vote"],
  authors: [{ name: "HALF Team" }],
  creator: "HALF Team",
  publisher: "HALF",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: siteUrl,
    siteName: "HALF",
    title: "HALF - 밸런스 게임",
    description: "50:50 균형의 논쟁 엔진. 사소하지만 팽팽한 일상의 딜레마에 투표하세요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HALF - 밸런스 게임",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HALF - 밸런스 게임",
    description: "50:50 균형의 논쟁 엔진. 사소하지만 팽팽한 일상의 딜레마에 투표하세요.",
    images: ["/og-image.png"],
    creator: "@half_game",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: 'Xr_DuBc_1lFVrHYQqVWTgxUb_7hJuTaU2Kp485rfXzQ',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

