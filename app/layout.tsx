import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aero Piston Engine - Digital Twin",
  description: "Simulated UAV engine telemetry, CSV replay and schematic 3D visualization. Educational prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
