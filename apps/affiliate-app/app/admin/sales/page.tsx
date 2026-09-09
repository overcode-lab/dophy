"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlusCircle,
  ShoppingBag,
  Search,
  SlidersHorizontal,
  Menu,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Footer, SideMenu, SideMenuDesktop } from "@repo/ui";
import { SaleItem, ProductInfo, AffiliateInfo, DateFilterType, DateState, QuickDatePreset } from "./types";
import {
  SalesMetricBanner,
  SalesQuickFilterChips,
  SalesActiveFilterChips,
  SalesCard,
  SalesFilterModal,
  SalesDetailModal,
} from "./components";

const PAGE_LIMIT = 8;

export default function AdminSalesListPage() {
  const router = useRouter();

  // Core Data State
  const [salesHistory, setSalesHistory] = useState<SaleItem[]>([]);
  const [productsList, setProductsList] = useState<ProductInfo[]>([]);
  const [affiliatesList, setAffiliatesList] = useState<AffiliateInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Summary Metrics State
  const [summaryMetrics, setSummaryMetrics] = useState({
    totalOmset: 0,
    totalPcs: 0,
    totalKomisi: 0,
  });

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);

  // Filter Modal & Criteria State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterDateType, setFilterDateType] = useState<DateFilterType>("all");
  const [specificDate, setSpecificDate] = useState<DateState | null>(null);
  const [rangeStartDate, setRangeStartDate] = useState<DateState | null>(null);
  const [rangeEndDate, setRangeEndDate] = useState<DateState | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>("all");
  const [selectedReferralFilter, setSelectedReferralFilter] = useState<string>("all");

  // Ref for Infinite Scroll Sentinel
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Debounce search query to query full DB on pause
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const buildQueryParams = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", PAGE_LIMIT.toString());
      params.set("t", Date.now().toString());

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }
      if (selectedProductFilter !== "all") {
        params.set("product", selectedProductFilter);
      }
      if (selectedReferralFilter !== "all") {
        params.set("referral", selectedReferralFilter);
      }
      if (filterDateType !== "all") {
        params.set("dateType", filterDateType);
      }
      if (filterDateType === "specific" && specificDate) {
        const m = String(specificDate.month).padStart(2, "0");
        const d = String(specificDate.day).padStart(2, "0");
        params.set("specificDate", `${specificDate.year}-${m}-${d}`);
      }
      if (filterDateType === "range") {
        if (rangeStartDate) {
          const m = String(rangeStartDate.month).padStart(2, "0");
          const d = String(rangeStartDate.day).padStart(2, "0");
          params.set("startDate", `${rangeStartDate.year}-${m}-${d}`);
        }
        if (rangeEndDate) {
          const m = String(rangeEndDate.month).padStart(2, "0");
          const d = String(rangeEndDate.day).padStart(2, "0");
          params.set("endDate", `${rangeEndDate.year}-${m}-${d}`);
        }
      }

      return params.toString();
    },
    [
      debouncedSearch,
      selectedProductFilter,
      selectedReferralFilter,
      filterDateType,
      specificDate,
      rangeStartDate,
      rangeEndDate,
    ],
  );

  const fetchSalesData = useCallback(
    async (page = 1, isAppend = false) => {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const queryString = buildQueryParams(page);
        const res = await fetch(`/api/admin/sales?${queryString}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const result = await res.json();
        if (result.success) {
          const newSales = result.data.sales || [];
          if (isAppend) {
            setSalesHistory((prev) => [...prev, ...newSales]);
          } else {
            setSalesHistory(newSales);
          }

          if (result.data.products) setProductsList(result.data.products);
          if (result.data.affiliates) setAffiliatesList(result.data.affiliates);
          if (result.data.pagination) {
            setCurrentPage(result.data.pagination.page);
            setHasMore(result.data.pagination.hasMore);
            setTotalCount(result.data.pagination.total);
          }
          if (result.data.summary) {
            setSummaryMetrics(result.data.summary);
          }
        }
      } catch (err) {
        console.error("Failed to fetch sales data:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [buildQueryParams],
  );

  // Authentication check & initial load / filter update
  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (!storedUser || storedRole !== "admin") {
      router.push("/admin/login");
      return;
    }

    // Always scan full DB from page 1 when search or filter criteria change
    fetchSalesData(1, false);
  }, [
    router,
    fetchSalesData,
    debouncedSearch,
    selectedProductFilter,
    selectedReferralFilter,
    filterDateType,
    specificDate,
    rangeStartDate,
    rangeEndDate,
  ]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      fetchSalesData(currentPage + 1, true);
    }
  }, [isLoadingMore, hasMore, isLoading, currentPage, fetchSalesData]);

  // Infinite Scroll Trigger via IntersectionObserver
  useEffect(() => {
    const target = observerTarget.current;
    if (!target || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.05,
      },
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoading, handleLoadMore]);

  const handleResetFilters = () => {
    setFilterDateType("all");
    setSpecificDate(null);
    setRangeStartDate(null);
    setRangeEndDate(null);
    setSelectedProductFilter("all");
    setSelectedReferralFilter("all");
    setSearchQuery("");
    setDebouncedSearch("");
    setIsFilterModalOpen(false);
  };

  const handleSelectQuickPreset = (preset: QuickDatePreset) => {
    setFilterDateType(preset);
  };

  const handleClearQuickPreset = () => {
    setFilterDateType("all");
  };

  // Distinct products list for filter dropdown
  const uniqueProducts = useMemo(() => {
    const list: string[] = [];
    productsList.forEach((p) => {
      if (p.name && !list.includes(p.name)) list.push(p.name);
    });
    return list;
  }, [productsList]);

  // Distinct referrals & affiliates list for filter dropdown
  const uniqueReferrals = useMemo(() => {
    const referralMap = new Map<string, { code: string; name: string }>();
    affiliatesList.forEach((a) => {
      if (a.referral_code) {
        referralMap.set(a.referral_code, {
          code: a.referral_code,
          name: a.full_name || a.referral_code,
        });
      }
    });
    return Array.from(referralMap.values());
  }, [affiliatesList]);

  const isFilterActive =
    filterDateType !== "all" || selectedProductFilter !== "all" || selectedReferralFilter !== "all";

  const remainingCount = Math.max(0, totalCount - salesHistory.length);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/admin/dashboard"
              className="p-2 -ml-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-base font-black text-slate-900 tracking-tight">Transaksi Penjualan</h1>
          </div>

          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden p-1.5 text-slate-700 hover:text-dophy-600 transition-colors flex items-center justify-center cursor-pointer"
            title="Buka Menu Navigasi Admin"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Container with Desktop Sticky SideMenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Desktop Sticky SideMenu */}
          <SideMenuDesktop />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 w-full space-y-5 text-left">
            {/* Header Title & Action Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-dophy-600" />
                  <span>Daftar Transaksi Penjualan</span>
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Kelola dan pantau seluruh catatan penjualan snack beserta distribusi komisi affiliator.
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                <Link
                  href="/admin/sales/new"
                  className="px-4 py-2.5 rounded-2xl bg-dophy-600 hover:bg-dophy-700 text-white font-black text-xs shadow-md shadow-dophy-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Transaksi</span>
                </Link>
              </div>
            </div>

            {/* 1 Fresh Colorful Wrapper Card (Total Omset, Snack Terjual, Total Komisi) */}
            <SalesMetricBanner
              totalOmset={summaryMetrics.totalOmset}
              totalPcs={summaryMetrics.totalPcs}
              totalKomisi={summaryMetrics.totalKomisi}
              isLoading={isLoading}
            />

            {/* Search Bar, Filter Button, and Quick Preset Chips */}
            <div className="space-y-2.5">
              {/* Row 1: Search Input & Filter Icon Button */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama produk, mitra, atau kode referral di seluruh database..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200/90 text-xs sm:text-sm font-bold bg-white focus:border-dophy-500 focus:ring-2 focus:ring-dophy-100 outline-none shadow-2xs"
                  />
                </div>

                {/* Filter Icon Button (Tanpa Wrapper Card) */}
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(true)}
                  className={`p-2.5 rounded-2xl transition-all flex items-center justify-center relative cursor-pointer active:scale-95 shrink-0 ${
                    isFilterActive
                      ? "text-dophy-600 bg-orange-50 hover:bg-orange-100/80"
                      : "text-slate-600 hover:text-dophy-600 hover:bg-slate-100"
                  }`}
                  title="Buka Filter Transaksi"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {isFilterActive && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-dophy-600 ring-2 ring-white animate-pulse" />
                  )}
                </button>
              </div>

              {/* Row 2: Quick Date Preset Chips (1 Hari, Kemarin, 3 Hari, Seminggu, 2 Minggu, Sebulan) */}
              <SalesQuickFilterChips
                activeDateType={filterDateType}
                onSelectPreset={handleSelectQuickPreset}
                onClear={handleClearQuickPreset}
              />

              {/* Row 3: Active Filter Chips Details */}
              <SalesActiveFilterChips
                isFilterActive={isFilterActive}
                dateType={filterDateType}
                specificDate={specificDate}
                rangeStartDate={rangeStartDate}
                rangeEndDate={rangeEndDate}
                selectedProduct={selectedProductFilter}
                selectedReferral={selectedReferralFilter}
                onReset={handleResetFilters}
              />
            </div>

            {/* Sales List Grid */}
            {isLoading ? (
              <div className="p-12 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-7 h-7 text-dophy-600 animate-spin" />
                <p className="text-xs font-bold text-slate-500">Mencari data transaksi di seluruh database...</p>
              </div>
            ) : salesHistory.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white border border-slate-200/80 shadow-xs text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-extrabold text-slate-800">
                    {debouncedSearch || isFilterActive
                      ? "Transaksi Tidak Ditemukan di Database"
                      : "Belum Ada Riwayat Transaksi"}
                  </p>
                  <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
                    {debouncedSearch || isFilterActive
                      ? "Coba sesuaikan filter atau kata kunci pencarian nama produk/mitra yang lain."
                      : "Mulai catat transaksi penjualan baru dengan mengklik tombol di bawah ini."}
                  </p>
                </div>
                {!debouncedSearch && !isFilterActive && (
                  <Link
                    href="/admin/sales/new"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dophy-600 text-white font-extrabold text-xs shadow-md shadow-dophy-500/20 hover:bg-dophy-700 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Buat Transaksi Sekarang</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {salesHistory.map((sale, idx) => (
                    <SalesCard
                      key={`${sale.id}-${idx}`}
                      sale={sale}
                      index={idx}
                      onClick={() => setSelectedSale(sale)}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Observer Target & Loading State */}
                <div ref={observerTarget} className="pt-3 pb-1 text-center">
                  {isLoadingMore ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 text-dophy-700 border border-orange-200/70 text-[11px] font-bold shadow-2xs animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 text-dophy-600 animate-spin shrink-0" />
                      <span>Memuat transaksi berikutnya...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-[1px] bg-slate-200/60 flex-1 max-w-[80px]" />
                      <span className="text-[11px] font-semibold text-slate-400">
                        Scroll untuk memuat lagi ({remainingCount} tersisa)
                      </span>
                      <div className="h-[1px] bg-slate-200/60 flex-1 max-w-[80px]" />
                    </div>
                  ) : salesHistory.length > 0 ? (
                    <div className="flex items-center justify-center gap-2.5">
                      <div className="h-[1px] bg-slate-200/60 flex-1 max-w-[60px] sm:max-w-[100px]" />
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100/90 text-slate-500 border border-slate-200/80 text-[11px] font-bold shadow-2xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="whitespace-nowrap">
                          {debouncedSearch || isFilterActive
                            ? `${totalCount} transaksi ditemukan`
                            : `Semua ${totalCount} transaksi telah dimuat`}
                        </span>
                      </div>
                      <div className="h-[1px] bg-slate-200/60 flex-1 max-w-[60px] sm:max-w-[100px]" />
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <SalesDetailModal sale={selectedSale} onClose={() => setSelectedSale(null)} />

      {/* 🔍 Comprehensive Filter Modal & DatePicker Modal */}
      <SalesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        dateType={filterDateType}
        setDateType={setFilterDateType}
        specificDate={specificDate}
        setSpecificDate={setSpecificDate}
        rangeStartDate={rangeStartDate}
        setRangeStartDate={setRangeStartDate}
        rangeEndDate={rangeEndDate}
        setRangeEndDate={setRangeEndDate}
        selectedProduct={selectedProductFilter}
        setSelectedProduct={setSelectedProductFilter}
        selectedReferral={selectedReferralFilter}
        setSelectedReferral={setSelectedReferralFilter}
        uniqueProducts={uniqueProducts}
        uniqueReferrals={uniqueReferrals}
        onReset={handleResetFilters}
      />

      {/* Reusable Footer */}
      <Footer variant="admin" />

      {/* Admin Navigation SideMenu (Mobile Drawer) */}
      <SideMenu isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
