import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Gaia Garden - Automação de Cultivo",
  description: "Monitoramento e inteligência IoT para cultivos indoor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="bg-gaia-bg text-gaia-darkText antialiased">
        {/* Container Principal Ocupando toda a tela sem rolagem externa */}
        <div className="flex h-screen w-screen overflow-hidden">
          {/* 1. COMPONENTE FIXO: Menu Lateral */}
          <Sidebar />

          {/* 2. ÁREA DE CONTEÚDO (Header + Miolo Dinâmico + Footer) */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* COMPONENTE FIXO SUPERIOR: Cabeçalho */}
            <Header />

            {/* 3. MIOLO CENTRAL (Onde entram as páginas de conteúdo) */}
            {/* O overflow-y-auto garante que apenas esta área central role */}
            <main className="flex-1 overflow-y-auto p-6 md:p-8">
              {children}
            </main>

            {/* COMPONENTE FIXO INFERIOR: Rodapé */}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
