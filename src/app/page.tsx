import React from "react";

export default function HomePage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* 📋 INTRODUÇÃO EM INGLÊS (Foco Profissional Agronômico) */}
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100/50">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-gaia-greenMint bg-gaia-greenDeep px-3 py-1 rounded-full">
            System Overview
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gaia-greenDeep mt-3 tracking-tight">
            Automated Environment Intel & Botanical Analytics
          </h2>
          <p className="text-gaia-darkText/80 mt-2 leading-relaxed text-sm md:text-base">
            Welcome to the Gaia Garden command center. The system is actively
            collecting real-time telemetry from distributed IoT sensor arrays
            across your indoor cultivation sectors. By processing microclimate
            data and root-zone metrics, our automation engine ensures optimal
            physiological development, resource efficiency, and predictable crop
            yields.
          </p>
        </div>
      </section>

      {/* 🚨 GRID DE HISTÓRICO DE ALERTAS ATIVOS (Baseado no layout anterior) */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-gaia-darkText/60">
            Active System Notifications
          </h3>
          <span className="h-2 w-2 rounded-full bg-gaia-alert-critical animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card de Alerta Crítico */}
          <div className="bg-gaia-cardDark text-white p-5 rounded-2xl border-l-4 border-gaia-alert-critical shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-gaia-alert-critical tracking-wider">
                  Critical Event
                </span>
                <h4 className="text-base font-semibold mt-0.5">
                  ZONE 02: SOIL MOISTURE CRITICAL
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Substrate moisture dropped below 15%. Automated irrigation
                  trigger failure.
                </p>
              </div>
            </div>
            <button className="mt-4 bg-gaia-alert-critical hover:bg-gaia-alert-critical/90 text-white font-semibold py-1.5 px-4 rounded-xl text-xs transition-all uppercase tracking-wide">
              Override & Irrigate
            </button>
          </div>

          {/* Card de Alerta Aviso */}
          <div className="bg-white p-5 rounded-2xl border-l-4 border-gaia-alert-warning text-gaia-darkText shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-gaia-alert-warning tracking-wider">
                  System Warning
                </span>
                <h4 className="text-base font-semibold mt-0.5">
                  NODE-04: LOW BATTERY
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  IoT sensor telemetry node battery is at 18%. Schedule
                  replacement within 48h.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌿 STATUS ATUAL DOS CULTIVOS INDOOR (Visão Geral por Ambiente) */}
      <section className="space-y-4">
        <h3 className="text-xs uppercase font-bold tracking-wider text-gaia-darkText/60">
          Live Cultivation Chambers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Métrica 1: Temperatura */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Ambient Temp
            </span>
            <div className="flex items-baseline space-x-1 my-2">
              <span className="text-2xl font-bold text-gaia-greenDeep">
                24.5
              </span>
              <span className="text-sm text-gray-500 font-medium">°C</span>
            </div>
            <span className="text-[10px] text-gaia-alert-success font-semibold bg-gaia-greenSignal px-2 py-0.5 rounded-md w-max">
              Within Target Range
            </span>
          </div>

          {/* Métrica 2: Umidade do Ar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Relative Humidity
            </span>
            <div className="flex items-baseline space-x-1 my-2">
              <span className="text-2xl font-bold text-gaia-greenDeep">68</span>
              <span className="text-sm text-gray-500 font-medium">%</span>
            </div>
            <span className="text-[10px] text-gaia-alert-success font-semibold bg-gaia-greenSignal px-2 py-0.5 rounded-md w-max">
              Optimal VPD
            </span>
          </div>

          {/* Métrica 3: Nível de CO2 */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Carbon Dioxide (CO₂)
            </span>
            <div className="flex items-baseline space-x-1 my-2">
              <span className="text-2xl font-bold text-gaia-greenDeep">
                410
              </span>
              <span className="text-sm text-gray-500 font-medium">ppm</span>
            </div>
            <span className="text-[10px] text-gaia-alert-warning font-semibold bg-orange-50 text-gaia-alert-warning px-2 py-0.5 rounded-md w-max">
              Atmospheric Baseline
            </span>
          </div>

          {/* Métrica 4: Iluminação PAR */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <span className="text-xs text-gray-400 font-medium">
              Photosynthetic Light (PAR)
            </span>
            <div className="flex items-baseline space-x-1 my-2">
              <span className="text-2xl font-bold text-gaia-greenDeep">98</span>
              <span className="text-sm text-gray-500 font-medium">% PPFD</span>
            </div>
            <span className="text-[10px] text-gaia-alert-success font-semibold bg-gaia-greenSignal px-2 py-0.5 rounded-md w-max">
              Full Spectrum Active
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
