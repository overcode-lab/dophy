"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (storedUser && storedRole === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/admin/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-3 border-dophy-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-extrabold text-slate-500">Mengarahkan ke Admin Panel DOPHY...</p>
      </div>
    </div>
  );
}
