import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Manager",
  description: "Simple task manager built with Next.js 15 and tRPC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <Link href="/" className="brand">
            Task Manager
          </Link>
        </header>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
