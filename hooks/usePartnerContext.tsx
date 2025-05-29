"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./useAuth";
import * as homeService from "@/feature/home/services/homeService";

interface PartnerContextType {
  hasPartner: boolean;
  loading: boolean;
}

const PartnerContext = createContext<PartnerContextType>({
  hasPartner: false,
  loading: true,
});

export const usePartnerContext = () => useContext(PartnerContext);

interface PartnerProviderProps {
  children: ReactNode;
}

export const PartnerProvider: React.FC<PartnerProviderProps> = ({
  children,
}) => {
  const [hasPartner, setHasPartner] = useState(false);
  const [loading, setLoading] = useState(true);
  const { uid } = useAuth();

  useEffect(() => {
    const checkPartnerStatus = async () => {
      if (!uid) {
        setLoading(false);
        return;
      }

      try {
        // カップル関係確認
        const coupleData = await homeService.getCoupleRelationship(uid);
        setHasPartner(!!coupleData);
      } catch (error) {
        console.error("パートナー状態取得エラー:", error);
      } finally {
        setLoading(false);
      }
    };

    checkPartnerStatus();
  }, [uid]);

  return (
    <PartnerContext.Provider value={{ hasPartner, loading }}>
      {children}
    </PartnerContext.Provider>
  );
};
