import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCC Hymns",
  description: "Celestial Church of Christ Hymns - Worship in Truth & Spirit",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-sans`}
      >
        <ThemeProvider>
            {children}
            <Toaster position="top-center" richColors />
            <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}

function ServiceWorkerRegister() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `
                    if ('serviceWorker' in navigator) {
                        window.addEventListener('load', function() {
                            navigator.serviceWorker.register('/sw.js').then(
                                function(registration) {
                                    console.log('Service Worker registration successful with scope: ', registration.scope);
                                },
                                function(err) {
                                    console.log('Service Worker registration failed: ', err);
                                }
                            );
                        });
                    }
                `,
            }}
        />
    )
}
