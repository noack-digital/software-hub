import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import "./globals.css";
import Providers from "./providers";
import { AuthProvider } from "./auth-provider";
import { ConditionalFooter } from "@/components/ConditionalFooter";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Software Hub",
  description: "Ihr Unternehmens-Software-Katalog",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <AuthProvider>
          <Providers>
            <div className="flex-grow">
              {children}
            </div>
            <ConditionalFooter />
          </Providers>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
