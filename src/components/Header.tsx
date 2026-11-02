import React from "react";
import HabitatSelector from "./HabitatSelector";
import SidebarToggle from "./SidebarToggle";
import UserMenu from "./UserMenu";

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 px-4 md:px-6 flex items-center justify-between">
      {/* Left section: Hamburger + Title */}
      <div className="flex items-center space-x-3">
        <SidebarToggle />
        <h2 className="text-gaia-darkText font-semibold text-base md:text-lg">
          Dashboard: Gaia Garden
        </h2>
      </div>

      <div className="flex items-center space-x-3 md:space-x-4">
        {/* 🔽 Seletor de Habitat */}
        <div className="hidden sm:block">
          <HabitatSelector />
        </div>

        {/* Status da Conexão IoT */}
        <div className="hidden md:flex items-center space-x-2 bg-gaia-greenSignal px-3 py-1.5 rounded-full text-gaia-greenDeep text-xs font-medium">
          <span className="h-2 w-2 rounded-full bg-gaia-alert-success animate-pulse" />
          <span>Sinais IoT: Online</span>
        </div>

        {/* Botão Notificação */}
        <button className="p-2 rounded-xl text-gray-500 hover:bg-gaia-bg hover:text-gaia-darkText transition-all relative">
          🔔
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gaia-alert-critical rounded-full" />
        </button>

        {/* Divisor */}
        <div className="h-6 w-px bg-gray-200 hidden sm:block" />

        {/* Usuário com menu dropdown */}
        <UserMenu />
      </div>
    </header>
  );
}
