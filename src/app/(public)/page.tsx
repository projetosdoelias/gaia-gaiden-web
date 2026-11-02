import React from "react";
import Link from "next/link";

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-gaia-bg flex flex-col justify-between p-6 md:p-12 font-sans antialiased selection:bg-gaia-greenMint selection:text-gaia-greenDeep">
      {/* 🟢 TOP BAR / HEADER MINIMALISTA */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between">
        {/* LOGO COMPONÍVEL GAIA GARDEN */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gaia-greenDeep flex flex-col items-center justify-center shadow-sm relative overflow-hidden group">
            {/* Elemento interno simulando o minimalismo tecnológico da folha + sinal */}
            <div className="w-4 h-4 rounded-full border-2 border-gaia-greenMint flex items-center justify-center">
              <div className="w-1 h-1 bg-gaia-greenMint rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gaia-greenDeep tracking-tight leading-none">
              Gaia
            </h1>
            <span className="text-xs font-semibold text-gaia-greenDeep/60 tracking-wider uppercase">
              Garden
            </span>
          </div>
        </div>

        {/* BOTÃO DE LOGIN */}
        <Link
          href="/dashboard"
          className="text-sm font-semibold text-gaia-greenDeep hover:opacity-80 transition-all border-b-2 border-gaia-greenDeep/20 hover:border-gaia-greenDeep pb-0.5"
        >
          Sign In
        </Link>
      </header>

      {/* 🌿 CONTEÚDO CENTRAL (MÍNIMO E PROFISSIONAL) */}
      <main className="w-full max-w-4xl mx-auto flex flex-col items-center text-center my-auto space-y-8">
        {/* LOGO AMPLIADO NO CENTRO */}
        <div className="w-20 h-20 rounded-2xl bg-gaia-greenDeep flex items-center justify-center shadow-md">
          <div className="w-8 h-8 rounded-full border-4 border-gaia-greenMint flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-gaia-greenMint rounded-full" />
          </div>
        </div>

        <div className="space-y-4 max-w-2xl">
          {/* FRASE ÚNICA DE EFEITO EM INGLÊS */}
          <h2 className="text-3xl md:text-5xl font-extrabold text-gaia-greenDeep tracking-tight leading-tight">
            Precision IoT automation and data intelligence for advanced indoor
            cultivation.
          </h2>
        </div>

        {/* BOTÃO PRINCIPAL DE ACESSO */}
        <Link
          href="/dashboard"
          className="inline-flex items-center bg-gaia-greenDeep hover:bg-gaia-greenDeep/90 text-white font-medium px-8 py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all space-x-2 text-sm md:text-base tracking-wide"
        >
          <span>Launch Platform</span>
          <span className="text-gaia-greenMint">→</span>
        </Link>
      </main>

      {/* 📋 RODAPÉ CLEAN */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-center text-[11px] text-gaia-darkText/40 tracking-wide">
        <span>GAIA GARDEN AGROTECH SYSTEMS &bull; ENTERPRISE GRADE</span>
      </footer>
    </div>
  );
}
