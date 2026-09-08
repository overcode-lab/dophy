"use client";

import React, { useState } from "react";
import Image from "next/image";
import { 
  MessageCircle, 
  Instagram, 
  ShoppingBag, 
  Sparkles, 
  Share2, 
  Users, 
  Check, 
  Flame,
  ChevronRight
} from "lucide-react";

// Custom TikTok Icon Component
function TikTokIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68 6.34 6.34 0 0 0 9.35 22a6.33 6.33 0 0 0 6.33-6.33V9.45a9.66 9.66 0 0 0 3.91 1.72V7.72a6.36 6.36 0 0 1-3.77-1.03z" />
    </svg>
  );
}

// Elegant Divider Component with Center Dot Accent
function SectionDivider() {
  return (
    <div className="relative py-2 flex items-center justify-center">
      <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
      <div className="absolute w-2.5 h-2.5 rounded-full bg-dophy-400 border-2 border-white shadow-sm animate-ping opacity-75" />
      <div className="absolute w-2 h-2 rounded-full bg-dophy-500 border border-white shadow-sm" />
    </div>
  );
}

export default function LinktreePage() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "DOPHY — You Need Dopamine",
        text: "Snack Krispi Kemasan 65gr Penambah Mood!",
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const socialLinks = [
    {
      id: "whatsapp",
      title: "Order WhatsApp",
      subtitle: "+62 851-9044-1622 (Respon Cepat)",
      url: "https://wa.me/6285190441622?text=Halo%20Admin%20Dophy!%20Saya%20ingin%20pesan%20snack%20Dophy%2065gr",
      icon: MessageCircle,
      badge: "Fast Order",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200/80 anim-badge-fast-1",
      variant: "whatsapp",
      iconColor: "text-emerald-600",
      animClass: "anim-play-pop-1",
    },
    {
      id: "tiktok",
      title: "TikTok Official",
      subtitle: "@you.need.dopamine",
      url: "https://www.tiktok.com/@you.need.dopamine?_r=1&_t=ZS-99SP0dMemyD",
      icon: TikTokIcon,
      badge: "Live & Video",
      badgeStyle: "bg-pink-50 text-pink-700 border-pink-200/80 anim-badge-fast-2",
      variant: "tiktok",
      iconColor: "text-slate-900",
      animClass: "anim-play-wiggle-1",
    },
    {
      id: "instagram",
      title: "Instagram Official",
      subtitle: "@you.need.dopamine",
      url: "https://www.instagram.com/you.need.dopamine?igsi=NTRkdGx0NDB3ZDYw&utm_source=qr",
      icon: Instagram,
      badge: "Katalog & Info",
      badgeStyle: "bg-purple-50 text-purple-700 border-purple-200/80 anim-badge-fast-1",
      variant: "instagram",
      iconColor: "text-purple-600",
      animClass: "anim-play-jelly-1",
    },
    {
      id: "affiliate",
      title: "Program Affiliate DOPHY",
      subtitle: "Gabung & Dapatkan Komisi",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://app.dophy.com",
      icon: Users,
      badge: "Mitra Bisnis",
      badgeStyle: "bg-dophy-100 text-dophy-800 border-dophy-200 anim-badge-fast-2",
      variant: "affiliate",
      iconColor: "text-dophy-600",
      animClass: "anim-play-pop-2",
    },
  ];

  const featuredProducts = [
    {
      name: "DOPHY Signature",
      weight: "65 gram",
      description: "Snack krispi lezat penambah mood!",
      image: "/assets/product-1.png",
      tag: "Best Seller 🔥",
      tagStyle: "bg-gradient-to-r from-red-600 to-orange-500 text-white font-extrabold shadow-sm shadow-red-500/20 border border-red-400/30 anim-badge-fast-1",
      animClass: "anim-card-jelly",
    },
    {
      name: "DOPHY Special",
      weight: "65 gram",
      description: "Gurih renyah bumbu melimpah!",
      image: "/assets/product-2.png",
      tag: "Favorit ⭐️",
      tagStyle: "bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold shadow-sm shadow-emerald-500/20 border border-emerald-400/30 anim-badge-fast-2",
      animClass: "anim-card-pop",
    },
  ];

  return (
    <main className="min-h-screen bg-[#fdfbf7] text-slate-900 flex flex-col items-center py-6 px-4 relative overflow-hidden select-none font-sans">
      {/* Soft Light Background Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-dophy-400/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute top-1/2 -left-36 w-64 h-64 bg-amber-400/15 rounded-full blur-[90px] pointer-events-none animate-pulse" />

      {/* Share Float Button Top Right */}
      <div className="w-full max-w-sm flex justify-end mb-1 z-20">
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-slate-200 backdrop-blur-md text-[11px] font-bold text-slate-700 hover:text-dophy-600 hover:border-dophy-400 transition-all duration-200 shadow-sm active:scale-95 cursor-pointer anim-button-heartbeat"
          title="Bagikan Halaman Ini"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-dophy-500 animate-spin" style={{ animationDuration: '4s' }} />}
          <span>{copied ? "Tersalin!" : "Bagikan"}</span>
        </button>
      </div>

      <div className="max-w-sm w-full z-10 space-y-5">
        
        {/* LOGO & BRAND HEADER (Fast Playful Sway & Scale) */}
        <section className="text-center space-y-2">
          <div className="relative w-36 h-20 mx-auto flex items-center justify-center anim-logo-fast">
            <Image
              src="/assets/logo-transparent.png"
              alt="DOPHY Logo"
              width={160}
              height={90}
              priority
              className="object-contain w-full h-full drop-shadow-[0_6px_16px_rgba(240,87,19,0.2)] transition-transform duration-300 hover:scale-115"
            />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-dophy-100 border border-dophy-200 text-dophy-700 text-[10px] font-extrabold uppercase tracking-wider anim-badge-fast-1">
              <Sparkles className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} /> YOU NEED DOPAMINE
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              DOPHY Snack Official
            </h1>
            <p className="text-slate-600 text-xs max-w-[280px] mx-auto leading-relaxed font-medium">
              Snack krispi 65gr penambah mood & energi harianmu 🍿✨
            </p>
          </div>
        </section>

        {/* SECTION DIVIDER 1 */}
        <SectionDivider />

        {/* COMPACT LINKS LIST WITH VARIED PLAYFUL ANIMATIONS */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 px-0.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            <Flame className="w-3.5 h-3.5 text-dophy-600 animate-bounce" style={{ animationDuration: '1.2s' }} />
            <span>Kanal Resmi & Pemesanan</span>
          </div>

          {socialLinks.map((item) => {
            const Icon = item.icon;

            const variantStyles = {
              whatsapp: "bg-white hover:bg-emerald-50/50 border-slate-200 hover:border-emerald-300 shadow-sm",
              tiktok: "bg-white hover:bg-pink-50/40 border-slate-200 hover:border-pink-300 shadow-sm",
              instagram: "bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-300 shadow-sm",
              affiliate: "bg-white hover:bg-dophy-50/50 border-slate-200 hover:border-dophy-300 shadow-sm",
            }[item.variant];

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block group ${item.animClass}`}
              >
                <div
                  className={`p-3.5 rounded-2xl border transition-all duration-200 group-hover:scale-[1.03] flex items-center gap-3.5 ${variantStyles}`}
                >
                  {/* Direct Icon With Playful Rotate/Scale */}
                  <Icon className={`w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-125 anim-icon-fun ${item.iconColor}`} />

                  {/* Clean Content Area */}
                  <div className="min-w-0 flex-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-xs text-slate-900 group-hover:text-dophy-600 transition-colors">
                        {item.title}
                      </h3>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded border text-[9px] font-extrabold flex-shrink-0 ${item.badgeStyle}`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </section>

        {/* SECTION DIVIDER 2 */}
        <SectionDivider />

        {/* COMPACT PRODUCT CATALOG GRID WITH PLAYFUL JELLY & POP */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              <ShoppingBag className="w-3.5 h-3.5 text-dophy-600 animate-pulse" />
              <span>Katalog Snack 65gr</span>
            </div>
            <span className="text-[10px] font-extrabold text-dophy-700 bg-dophy-100 px-2 py-0.5 rounded-full border border-dophy-200 anim-badge-fast-1">
              Pilihan Rasa
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {featuredProducts.map((prod, idx) => (
              <div
                key={idx}
                className={`group rounded-2xl bg-white border border-slate-200/90 p-3 flex flex-col justify-between hover:border-dophy-400 hover:shadow-md transition-all duration-300 ${prod.animClass}`}
              >
                <div className="space-y-2.5">
                  {/* Product Image with Wiggle Hover */}
                  <div className="relative w-full h-28 flex items-center justify-center p-1 overflow-hidden">
                    <Image
                      src={prod.image}
                      alt={prod.name}
                      width={100}
                      height={100}
                      className="object-contain max-h-full transition-transform duration-300 group-hover:scale-115 group-hover:rotate-3 drop-shadow-[0_4px_10px_rgba(0,0,0,0.08)]"
                    />
                    <span className={`absolute top-0 left-0 px-2 py-0.5 rounded-full text-[9px] ${prod.tagStyle}`}>
                      {prod.tag}
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="text-left space-y-1">
                    <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-dophy-600 transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-600 leading-snug">
                      {prod.description}
                    </p>
                  </div>
                </div>

                {/* Snappy Heartbeat Action Button */}
                <a
                  href="https://wa.me/6285190441622?text=Halo%20Admin%20Dophy!%20Saya%20mau%20order%20snack%20Dophy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-dophy-500 hover:bg-dophy-600 text-white text-xs font-bold transition-all duration-200 shadow-sm shadow-dophy-500/20 active:scale-95 flex items-center justify-center gap-1 whitespace-nowrap anim-button-heartbeat"
                >
                  <span>Order Now</span>
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION DIVIDER 3 */}
        <SectionDivider />

        {/* COMPACT FOOTER */}
        <footer className="pt-2 text-center space-y-0.5 text-slate-500 text-[11px]">
          <p className="font-semibold">© {new Date().getFullYear()} DOPHY (Dopamine Snack)</p>
          <p className="text-[10px] text-slate-400 font-medium">All rights reserved · Official Linktree</p>
        </footer>

      </div>
    </main>
  );
}
