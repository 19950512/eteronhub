import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "../components/footer";
import { Header } from "../components/header";
import { TabBar } from "../components/layout/tab-bar";
import { ServiceWorkerRegister } from "../components/pwa/service-worker-register";
import { AuthProvider } from "../lib/auth/auth-context";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
} from "../lib/site";
import "./globals.css";

// why: o eixo wdth permite usar a mesma família estreitada nos títulos
// (font-stretch em tokens.css) sem baixar uma segunda fonte.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Vagas na metalurgia e estruturas metálicas`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
  openGraph: { type: "website", locale: "pt_BR", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>
        <a className="skip-link" href="#conteudo">
          Pular para o conteúdo
        </a>
        <AuthProvider>
          <Header />
          <main id="conteudo" className="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <TabBar />
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
