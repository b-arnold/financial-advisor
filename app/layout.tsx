import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import CommandCenter from "@/components/features/shell/CommandCenter";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Northstar — Command Center",
  description: "Your accounts, spending, debts and funds in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full antialiased", "font-sans", geist.variable)}>
      <head>
        {/* The command center renders inline styles that reference these font
            families by name ('Geist', 'Newsreader', 'Geist Mono'). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Newsreader:opsz,wght@6..72,400;6..72,500&family=Geist+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        {/* The command center shell (store, responsive chrome, modals) wraps every route;
            each page renders its screen into the shell's content area. */}
        <CommandCenter>{children}</CommandCenter>
      </body>
    </html>
  );
}
