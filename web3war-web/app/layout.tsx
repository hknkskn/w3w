import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using Outfit as per PRD
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Web3War | Decentralized Strategy MMO",
  description: "Build your battalion, conquer territories, and earn crypto in the ultimate Web3 strategy game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans bg-[#1a1a1a] text-slate-200 min-h-screen relative overflow-x-hidden`}>
        {/* Global Background Layer */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
            style={{ backgroundImage: "url('/image/Background.png')" }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-slate-900/50 to-slate-800/80"></div>
        </div>

        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
