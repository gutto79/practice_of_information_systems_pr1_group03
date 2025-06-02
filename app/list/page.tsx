"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import ListContainer from "@/feature/list/display/listContainer";
import { usePartnerContext } from "@/hooks/usePartnerContext";

const ListPage = () => {
  const { hasPartner, loading } = usePartnerContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasPartner) {
      router.push("/home");
    }
  }, [hasPartner, loading, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        読み込み中...
      </div>
    );
  }

  if (!hasPartner) {
    return null; // リダイレクト中は何も表示しない
  }

  return <ListContainer />;
};

export default ListPage;
