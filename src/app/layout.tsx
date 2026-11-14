import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "WTC Gem Lab | Gemstone Identification, Screening & Certification",
  description:
    "Authoritative independent gemological testing laboratory specializing in Natural, Heated, and Synthetic gemstone screening, inclusion microscopy, and online report verification.",
  keywords: [
    "WTC Gem Lab",
    "Gemological Laboratory",
    "Gemstone Identification",
    "Heated vs Unheated",
    "Synthetic Gemstone Screening",
    "Synthetic Discrimination",
    "Report Verification",
    "PVC Card Report",
    "Gem Box Sticker",
    "A4 Certificate"
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col bg-[#0B1120] text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
        <Navbar />
        <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
