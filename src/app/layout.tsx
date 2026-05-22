import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ParallelogramDrive | The Geometry of Infinite Storage",
  description: "Distributed infrastructure secured by Telegram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`text-on-background min-h-screen flex flex-col font-body-sm selection:bg-primary-container selection:text-white overflow-x-hidden bg-[#050505]`}>
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
