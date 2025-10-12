import type { Metadata } from "next";
import { Footer } from "./components/Footer";
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
      <body className="antialiased min-h-screen flex flex-col">
        <UserProvider>
          <Header />
          <main className="flex-1 w-full pt-[68px] pb-[180px] bg-[#f8f4eb]">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
