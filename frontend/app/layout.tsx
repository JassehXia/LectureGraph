import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LectureGraph",
  description: "AI-powered lecture analysis and visualization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-mesh min-h-screen">
        {children}
      </body>
    </html>
  );
}
