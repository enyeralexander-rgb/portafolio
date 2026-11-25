import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Big_Shoulders, Space_Mono } from "next/font/google";
import { SITIO } from "@/data/contenido";
import { cssCursores } from "@/lib/cursores";
import { SITE_NOINDEX } from "@/lib/noindex";
import "./globals.css";

const display = Big_Shoulders({
  subsets: ["latin", "latin-ext"],
  weight: "variable",
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

const URL_SITIO = process.env.SITE_URL || undefined;

export const metadata: Metadata = {
  metadataBase: URL_SITIO ? new URL(URL_SITIO) : undefined,
  title: SITIO.titulo,
  description: SITIO.descripcion,
  alternates: URL_SITIO ? { canonical: "/" } : undefined,
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: SITIO.titulo,
    title: SITIO.titulo,
    description: SITIO.descripcion,
  },
  twitter: {
    card: "summary_large_image",
    title: SITIO.titulo,
    description: SITIO.descripcion,
  },
  robots: SITE_NOINDEX ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#1d1a17",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${display.variable} ${mono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: cssCursores() }} />
      </head>
      <body>
        {children}
        <noscript>
          <style>{".boot{display:none}"}</style>
        </noscript>
      </body>
    </html>
  );
}
