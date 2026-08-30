import React from "react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gaia-greenDeep text-white flex flex-col min-h-screen border-r border-gaia-greenDeep/20">
      {/* Brand/Logo Area */}
      <div className="p-6 border-b border-white/10 flex items-center space-x-3">
        {/* Ícone Minimalista Simulado */}
        <div className="w-8 h-8 rounded-lg bg-gaia-greenMint flex items-center justify-center text-gaia-greenDeep font-bold">
          G
        </div>
        <div>
          <h1 className="font-bold text-lg leading-none tracking-wide">Gaia</h1>
          <span className="text-xs text-gaia-greenMint font-medium">
            Garden
          </span>
        </div>
      </div>

      {/* Navegação Principal */}
      <nav className="flex-1 p-4 space-y-1">
        <Link
          href="/"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/10 text-gaia-greenMint font-medium transition-all"
        >
          <span>📊 Dashboard</span>
        </Link>
        <Link
          href="/sensores"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
        >
          <span>🌿 Sensores</span>
        </Link>
        <Link
          href="/automacao"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
        >
          <span>⚙️ Automação</span>
        </Link>
        <Link
          href="/relatorios"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
        >
          <span>📈 Relatórios</span>
        </Link>
      </nav>

      {/* Configurações no final da barra */}
      <div className="p-4 border-t border-white/10">
        <Link
          href="/configuracoes"
          className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
        >
          <span>🛠️ Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
