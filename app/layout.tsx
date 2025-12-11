import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegister from "./ui/ui/sw-register";
// FIXED: Removed the extra '/ui' from the path
// import ServiceWorkerRegister from "./ui/sw-register"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. ADDED VIEWPORT (Crucial for Mobile App "Feel")
export const viewport: Viewport = {
  themeColor: "#E30613", // Your Brand Red
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming like a native app
};

export const metadata: Metadata = {
  title: {
    template: "%s | KVTS Industries",
    default: "KVTS Industries | ERP System",
  },
  description: "Enterprise Resource Planning System for KVTS Industries. Production, Sales, and Accounting Management.",
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'KVTS ERP',
  },
  formatDetection: {
    telephone: false,
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
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}