import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getAuthToken, parseJwt } from "../utils/auth";

// 🌟 Transaction 타입에 category 추가
export interface Transaction {
  id: string;
  date: string;
  currency: string;
  amount: number;
  rate: number;
  finalKrw: number;
  status: "COMPLETED" | "WAITING" | "FAILED";
  title: string;
  type: "TRANSFER" | "CHARGE" | "EXCHANGE" | "INCOMING";
  category: "PERSONAL" | "BUSINESS"; // 🌟 개인/기업 구분 필드
}

interface WalletContextType {
  hasAccount: boolean;
  setHasAccount: (status: boolean) => void;
  userAccount: string;
  setUserAccount: (acc: string) => void;
  balances: { KRW: number; USD: number; JPY: number; EUR: number };
  setBalances: React.Dispatch<
    React.SetStateAction<{ KRW: number; USD: number; JPY: number; EUR: number }>
  >;
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  // 🌟 executeTransfer에 category 인자 추가
  executeTransfer: (
    toAccount: string,
    amount: number,
    currency: string,
    rate: number,
    debitAmount: number,
    creditAmount: number,
    title: string,
    category: "PERSONAL" | "BUSINESS",
  ) => void;
  resetAccount: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string>("guest");
  const [hasAccount, setHasAccount] = useState(false);
  const [userAccount, setUserAccount] = useState("");
  const [balances, setBalances] = useState({ KRW: 0, USD: 0, JPY: 0, EUR: 0 });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const sanitizeNumber = (val: any): number => {
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    const sanitized = parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(sanitized) ? 0 : sanitized;
  };

  const loadUserData = (id: string) => {
    const savedData = localStorage.getItem(`wallet_data_${id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setHasAccount(parsed.hasAccount || false);
      setUserAccount(parsed.userAccount || "");
      setBalances({
        KRW: sanitizeNumber(parsed.balances?.KRW),
        USD: sanitizeNumber(parsed.balances?.USD),
        JPY: sanitizeNumber(parsed.balances?.JPY),
        EUR: sanitizeNumber(parsed.balances?.EUR),
      });
      setTransactions(parsed.transactions || []);
    } else {
      setHasAccount(false);
      setUserAccount("");
      setBalances({ KRW: 0, USD: 0, JPY: 0, EUR: 0 });
      setTransactions([]);
    }
  };

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (token) {
        const decoded = parseJwt(token);
        const currentId = decoded?.sub || decoded?.email || "guest";
        if (userId !== currentId) {
          setUserId(currentId);
          loadUserData(currentId);
        }
      }
    };
    checkAuth();
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (userId !== "guest" && userAccount !== "") {
      const dataToSave = { hasAccount, userAccount, balances, transactions };
      localStorage.setItem(`wallet_data_${userId}`, JSON.stringify(dataToSave));
    }
  }, [hasAccount, userAccount, balances, transactions, userId]);

  const executeTransfer = (
    toAccount: string,
    amount: number,
    currency: string,
    rate: number,
    debitAmount: number,
    creditAmount: number,
    title: string,
    category: "PERSONAL" | "BUSINESS",
  ) => {
    if (toAccount === userAccount) return;

    // 1. 내 출금 처리
    setBalances((prev) => ({
      ...prev,
      KRW: sanitizeNumber(prev.KRW) - debitAmount,
    }));
    const outTx: Transaction = {
      id: `TX-${category === "BUSINESS" ? "BIZ" : "PER"}-${Date.now()}`, // 🌟 ID 접두사 구분
      date: new Date().toISOString().split("T")[0],
      type: "TRANSFER",
      category, // 🌟 카테고리 기록
      title: `${title} (${category === "BUSINESS" ? "기업 정산" : "개인 송금"})`,
      amount: -amount,
      currency,
      rate,
      finalKrw: debitAmount,
      status: "COMPLETED",
    };
    setTransactions((prev) => [outTx, ...prev]);

    // 2. 상대방 입금 처리 (로컬 스토리지 수정)
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("wallet_data_")) {
        const rawData = localStorage.getItem(key);
        if (rawData) {
          const otherData = JSON.parse(rawData);
          if (otherData.userAccount === toAccount) {
            otherData.balances.KRW =
              sanitizeNumber(otherData.balances?.KRW) + creditAmount;
            const inTx: Transaction = {
              id: `TX-IN-${Date.now()}`,
              date: new Date().toISOString().split("T")[0],
              type: "INCOMING",
              category, // 🌟 상대방에게도 카테고리 전달
              title: `가상계좌 입금 확인 (${category === "BUSINESS" ? "정산금" : "개인"})`,
              amount: amount,
              currency,
              rate,
              finalKrw: creditAmount,
              status: "COMPLETED",
            };
            otherData.transactions = [inTx, ...(otherData.transactions || [])];
            localStorage.setItem(key, JSON.stringify(otherData));
            break;
          }
        }
      }
    }
  };

  const resetAccount = () => {
    if (userId !== "guest") {
      localStorage.removeItem(`wallet_data_${userId}`);
      window.location.reload();
    }
  };

  const addTransaction = (tx: Transaction) =>
    setTransactions((prev) => [tx, ...prev]);

  return (
    <WalletContext.Provider
      value={{
        hasAccount,
        setHasAccount,
        userAccount,
        setUserAccount,
        balances,
        setBalances,
        transactions,
        addTransaction,
        executeTransfer,
        resetAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet must be used within a WalletProvider");
  return context;
};
