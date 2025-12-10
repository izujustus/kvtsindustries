import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | KVTS Industries",
    default: "KVTS Industries | ERP System",
  },
  description: "Enterprise Resource Planning System for KVTS Industries. Production, Sales, and Accounting Management.",
  icons: {
    icon: "/logo.png", // This will use your logo in the browser tab
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full bg-gray-50 text-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}