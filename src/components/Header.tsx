import React from "react";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between">
      {/* Título Contextual ou Busca */}
      <div className="flex items-center">
        <h2 className="text-gaia-darkText font-semibold text-lg">
          Dashboard: Gaia Garden
        </h2>
      </div>

      {/* Notificações, Status do Hub e Perfil */}
      <div className="flex items-center space-x-4">
        {/* Status da Conexão IoT Global */}
        <div className="flex items-center space-x-2 bg-gaia-greenSignal px-3 py-1.5 rounded-full text-gaia-greenDeep text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-gaia-alert-success animate-pulse" />
          <span>Sinais IoT: Online</span>
        </div>

        {/* Botão Notificação */}
        <button className="p-2 rounded-xl text-gray-500 hover:bg-gaia-bg hover:text-gaia-darkText transition-all relative">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gaia-alert-critical rounded-full" />
        </button>

        {/* Divisor */}
        <div className="h-6 w-px bg-gray-200" />

        {/* Usuário / Cultivador */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gaia-greenDeep/10 text-gaia-greenDeep flex items-center justify-center font-bold text-sm">
            C
          </div>
          <span className="text-sm font-medium text-gaia-darkText hidden md:inline">
            Cultivador Gaia
          </span>
        </div>
      </div>
    </header>
  );
}
