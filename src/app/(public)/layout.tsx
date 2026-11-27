import type { Metadata } from "next";
import "./../globals.css";

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
        {children}
      </body>
    </html>
  );
}
