import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import ServiceWorkerRegistrar from "@/components/service-worker-registrar";
import { AuthProvider } from "@/lib/auth-context";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#F8FAFB",
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
        {/* Smartlook Analytics */}
        <Script id="smartlook" strategy="afterInteractive">
          {`
            window.smartlook||(function(d) {
              var o=window.smartlook=function(){ o.api.push(arguments)},h=d.getElementsByTagName('head')[0];
              var c=d.createElement('script');o.api=new Array();c.async=true;c.type='text/javascript';
              c.charset='utf-8';c.src='https://web-sdk.smartlook.com/recorder.js';
              c.onload=function(){ window.smartlook('init', '37dfbcca833fb971c081c844ada70da706407ed6', { region: 'eu' }); };
              h.appendChild(c);
            })(document);
          `}
        </Script>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  );
}
