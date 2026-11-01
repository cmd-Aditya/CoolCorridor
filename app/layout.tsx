import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CoolCorridor — Cooler Places. Brighter Days.",
  description:
    "CoolCorridor helps you navigate urban heat with real-time microclimate telemetry, ranked cooling refuges, and heat-mitigated routes.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0A0D08] text-white antialiased selection:bg-[#7A9A6E]/30 selection:text-[#C4B99A]`}
      >
        {children}
      </body>
    </html>
  );
}
