import type { Metadata } from "next";
import "./../globals.css";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HabitatProvider } from "@/lib/context/HabitatContext";
import { SidebarProvider } from "@/lib/context/SidebarContext";
import { UserProvider } from "@/lib/context/UserContext";

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
        <HabitatProvider>
          <SidebarProvider>
            <UserProvider>
              <div className="flex h-screen w-screen overflow-hidden">
                <Sidebar />

                <div className="flex-1 flex flex-col overflow-hidden">
                  <Header />

                  <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                    {children}
                  </main>

                  <Footer />
                </div>
              </div>
            </UserProvider>
          </SidebarProvider>
        </HabitatProvider>
      </body>
    </html>
  );
}
