import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeatherStack",
  description: "Full-stack weather application with role-based auth",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
