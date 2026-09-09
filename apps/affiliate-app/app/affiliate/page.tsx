"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@repo/ui";

export default function AffiliatePortalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (storedUser && storedRole === "affiliate") {
      router.replace("/affiliate/dashboard");
    } else {
      router.replace("/affiliate/login");
    }
  }, [router]);

  return <LoadingSpinner fullPage text="Mengarahkan ke halaman login mitra..." />;
}
