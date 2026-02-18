import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ServiceWorkerRegistrar from "@/components/service-worker-registrar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2F2F7" },
    { media: "(prefers-color-scheme: dark)",  color: "#000000" },
  ],
};

export const metadata: Metadata = {
  title: "ROSCO - Handyman Management",
  description: "Professional handyman and maintenance business management",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ROSCO",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA & iOS home screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ROSCO" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased">
        <ServiceWorkerRegistrar />
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "500",
            },
          }}
        />
      </body>
    </html>
  );
}
