import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ServiceWorkerRegistrar from "@/components/service-worker-registrar";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F5F8F6",
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
    <html lang="en" className={inter.variable}>
      <head>
        {/* PWA & iOS home screen */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ROSCO" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.smartlook||(function(d) {
                var o=smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
                var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
                c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';h.appendChild(c);
              })(document);
              smartlook('init', '37dfbcca833fb971c081c844ada70da706407ed6', { region: 'eu' });
            `,
          }}
        />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ServiceWorkerRegistrar />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                fontFamily: "var(--font-inter), -apple-system, system-ui, sans-serif",
                borderRadius: "14px",
                fontSize: "14px",
                fontWeight: "500",
                background: "#FFFFFF",
                color: "#1C2B22",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0px 4px 24px rgba(0,0,0,0.10)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
