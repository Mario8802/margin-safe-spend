import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://margin-safe-spend.mariokoshn.chatgpt.site"),
  title: "Margin — Safe to Spend",
  description: "Know what is truly safe to spend after bills, reserves, savings and real life.",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
  openGraph: {
    title: "Margin — Safe to Spend",
    description: "Know what is truly safe to spend after bills, reserves, savings and real life.",
    url: "/",
    siteName: "Margin",
    images: [{ url: "/og.png", width: 1729, height: 910, alt: "Margin — Safe to Spend" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Margin — Safe to Spend",
    description: "Know what is truly safe to spend after bills, reserves, savings and real life.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
