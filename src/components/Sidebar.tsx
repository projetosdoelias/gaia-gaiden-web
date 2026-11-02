"use client";

import React from "react";
import Link from "next/link";
import { useSidebar } from "@/lib/context/SidebarContext";

export default function Sidebar() {
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* 🔲 Backdrop overlay (mobile only) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* 🧭 Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64
          bg-gaia-greenDeep text-white
          flex flex-col
          border-r border-gaia-greenDeep/20
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand/Logo Area */}
        <div className="p-6 border-b border-white/10 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gaia-greenMint flex items-center justify-center text-gaia-greenDeep font-bold">
            G
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none tracking-wide">Gaia</h1>
            <span className="text-xs text-gaia-greenMint font-medium">Garden</span>
          </div>
        </div>

        {/* Navegação Principal */}
        <nav className="flex-1 p-4 space-y-1">
          <Link
            href="/dashboard"
            onClick={close}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/10 text-gaia-greenMint font-medium transition-all"
          >
            <span>📊 Dashboard</span>
          </Link>
          <Link
            href="/telemetry"
            onClick={close}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
          >
            <span>🌿 Telemetry</span>
          </Link>
          <Link
            href="/automacao"
            onClick={close}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
          >
            <span>⚙️ Automação</span>
          </Link>
          <Link
            href="/relatorios"
            onClick={close}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
          >
            <span>📈 Relatórios</span>
          </Link>
        </nav>

        {/* Configurações no final da barra */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/configuracoes"
            onClick={close}
            className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 text-gray-300 hover:text-white transition-all"
          >
            <span>🛠️ Configurações</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
