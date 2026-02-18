import type { Metadata } from "next";
import {Analytics} from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "AI Assistant",
  description: "Your personal AI assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}
        <Analytics/>
      </body>
    </html>
  );
}