import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[hsl(var(--footer-bg))] text-[hsl(var(--footer-fg))] border-t border-[hsl(var(--footer-border))] py-8 md:py-12 mt-auto w-full">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <p className="text-sm md:text-base font-medium tracking-wide opacity-90">
          Desarrollado por BlackSheepDev para Aloeve 2026
        </p>
      </div>
    </footer>
  );
}