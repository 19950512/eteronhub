import type { ReactNode } from "react";
import { Header } from "../components/header";
import { AuthProvider } from "../lib/auth/auth-context";
import "./globals.css";

export const metadata = {
  title: "EteronHub",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <Header />
          <main className="main">
            <div className="container">{children}</div>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
