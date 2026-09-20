import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aero Piston Engine - Digital Twin",
  description: "Real-time Digital Twin System for MALE UAV Aero Piston Engines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
