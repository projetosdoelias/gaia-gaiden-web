import React from "react";

export default function DashboardPage() {
  // Timestamp simulado de atualização para os cards
  const lastUpdated = "Last updated: Just now (10:11 PM)";

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 🚀 CABEÇALHO CONTEXTUAL DA TELA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gaia-greenDeep tracking-tight">
            Environmental Telemetry
          </h2>
          <p className="text-xs text-gaia-darkText/60">
            Live metrics from Climate Zone 01
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl shadow-xs border border-gray-100 w-max">
          <span className="h-2 w-2 rounded-full bg-gaia-alert-success animate-pulse" />
          <span className="text-xs font-semibold text-gaia-greenDeep">
            Sensors Syncing
          </span>
        </div>
      </div>

      {/* 📊 GRID DE METRICAS (Responsivo: 1 col no mobile, 3 col no desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: TEMPERATURA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">
                Ambient Temperature
              </span>
              <span className="text-lg">🌡️</span>
            </div>
            <div className="flex items-baseline space-x-1 my-3">
              <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">
                24.5
              </span>
              <span className="text-lg text-gaia-darkText/60 font-semibold">
                °C
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            {lastUpdated}
          </span>
        </div>

        {/* CARD 2: UMIDADE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">
                Relative Humidity
              </span>
              <span className="text-lg">💧</span>
            </div>
            <div className="flex items-baseline space-x-1 my-3">
              <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">
                62
              </span>
              <span className="text-lg text-gaia-darkText/60 font-semibold">
                %
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            {lastUpdated}
          </span>
        </div>

        {/* CARD 3: VPD (Destaque Sutil de UX) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border-2 border-gaia-greenMint/40 flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow relative overflow-hidden">
          {/* Tag indicativa de status ideal do VPD */}
          <div className="absolute top-0 right-0 bg-gaia-greenSignal text-gaia-greenDeep font-bold text-[9px] uppercase tracking-wider px-3 py-1 rounded-bl-xl">
            Optimal
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gaia-darkText/50 uppercase tracking-wider">
                Vapor Pressure Deficit
              </span>
            </div>
            <div className="flex items-baseline space-x-1 my-3">
              <span className="text-4xl font-extrabold text-gaia-greenDeep tracking-tight">
                1.15
              </span>
              <span className="text-lg text-gaia-darkText/60 font-semibold">
                kPa
              </span>
            </div>
          </div>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">
            {lastUpdated}
          </span>
        </div>
      </div>

      {/* 📈 CARD DO GRÁFICO DE HISTÓRICO DE VPD (Mock estrutural em CSS/SVG puro) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-gaia-greenDeep uppercase tracking-wider">
              VPD Historical Trend
            </h3>
            <p className="text-xs text-gray-400">
              Last 24 hours timeline performance
            </p>
          </div>
          {/* Filtro fictício de tempo comum em Dashboards */}
          <div className="flex bg-gaia-bg p-1 rounded-lg text-xs font-medium text-gaia-darkText/70 self-start sm:self-auto">
            <span className="bg-white text-gaia-greenDeep px-3 py-1 rounded-md shadow-2xs font-bold">
              24h
            </span>
            <span className="px-3 py-1 opacity-50">7d</span>
            <span className="px-3 py-1 opacity-50">30d</span>
          </div>
        </div>

        {/* 💻 SVG Mock do Gráfico (Responsivo, estático e limpo para simular a linha do VPD) */}
        <div className="w-full bg-gaia-bg/30 rounded-xl p-4 border border-gray-100/50">
          <div className="h-64 w-full relative flex flex-col justify-between">
            {/* Linhas de Grade de fundo fictícias (Gridlines) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
              <div className="border-b border-dashed border-gray-200 w-full h-0" />
              <div className="border-b border-dashed border-gray-200 w-full h-0" />
              <div className="border-b border-dashed border-gray-200 w-full h-0" />
              <div className="border-b border-dashed border-gray-200 w-full h-0" />
            </div>

            {/* O Gráfico em Vetor SVG que estica com a tela */}
            <svg
              className="w-full h-full absolute inset-0 overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              {/* Gradiente sutil abaixo da linha do gráfico */}
              <defs>
                <linearGradient id="vpdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A4E0C3" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#A4E0C3" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Área preenchida */}
              <path
                d="M 0 80 Q 20 40 40 60 T 80 30 T 100 50 L 100 100 L 0 100 Z"
                fill="url(#vpdGradient)"
              />
              {/* Linha principal do gráfico */}
              <path
                d="M 0 80 Q 20 40 40 60 T 80 30 T 100 50"
                fill="none"
                stroke="#0F3B2E"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>

            {/* Labels fictícias do eixo Y */}
            <div className="absolute left-2 top-0 bottom-0 flex flex-col justify-between text-[9px] text-gray-400 font-mono pointer-events-none">
              <span>1.6 kPa</span>
              <span>1.2 kPa</span>
              <span>0.8 kPa</span>
              <span>0.4 kPa</span>
            </div>
          </div>

          {/* Labels fictícias do eixo X (Tempo) */}
          <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100 text-[10px] text-gray-400 font-medium px-4">
            <span>Yesterday, 10 PM</span>
            <span>6 AM</span>
            <span>2 PM</span>
            <span>Today, 10 PM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
