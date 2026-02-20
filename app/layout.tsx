import React from "react"
import { SessionProvider } from "@/components/session-provider";
import { ReduxProvider } from "@/components/providers/redux-provider";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const _inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const _spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  title: "Tablero - Gestion de Proyectos",
  description:
    "Sistema de gestion de tareas y proyectos para equipos de trabajo",
};

export const viewport: Viewport = {
  themeColor: "#1a1f2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${_inter.variable} ${_spaceGrotesk.variable} font-sans antialiased`}
      >
        <ReduxProvider>
          <SessionProvider>
            {children}
            <Toaster />
          </SessionProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
