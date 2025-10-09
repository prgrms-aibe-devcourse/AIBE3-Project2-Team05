import type { Metadata } from "next";
import { Header } from "./components/Header";

import { UserProvider } from "./context/UserContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "FIT",
  description: "FIT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <UserProvider>
          <Header />
          <main>{children}</main>
        </UserProvider>
        <footer />
      </body>
    </html>
  );
}
