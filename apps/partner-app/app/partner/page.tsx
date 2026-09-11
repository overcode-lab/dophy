"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@repo/ui";

export default function PartnerPortalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("dophy_user");
    const storedRole = localStorage.getItem("dophy_role");

    if (storedUser && storedRole === "partner") {
      router.replace("/partner/dashboard");
    } else {
      router.replace("/partner/login");
    }
  }, [router]);

  return <LoadingSpinner fullPage text="Mengarahkan ke halaman login partner..." />;
}
