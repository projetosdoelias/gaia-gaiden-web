import React from "react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 px-6 py-3 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
      <div>
        <span>
          &copy; {new Date().getFullYear()} Gaia Garden Automation. Todos os
          direitos reservados.
        </span>
      </div>
      <div className="flex items-center space-x-4 mt-2 sm:mt-0">
        <span>Hardware v1.2.0-beta</span>
        <span className="text-gaia-greenDeep font-medium">
          Latência de Rede: 24ms
        </span>
      </div>
    </footer>
  );
}
