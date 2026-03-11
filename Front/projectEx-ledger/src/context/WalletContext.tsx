import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { getAuthToken, parseJwt } from "../utils/auth";

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
  category: "PERSONAL" | "BUSINESS";
}

interface WalletContextType {
  hasPersonalAccount: boolean;
  personalAccount: string;
  personalBalances: Record<string, number>;
  hasCorporateAccount: boolean;
  corporateAccount: string;
  corporateBalances: Record<string, number>;
  transactions: Transaction[];
  setPersonalAccount: (acc: string) => void;
  setCorporateAccount: (acc: string) => void;
  executeTransfer: (
    toAcc: string,
    amt: number,
    cur: string,
    rate: number,
    debit: number,
    credit: number,
    title: string,
    category: "PERSONAL" | "BUSINESS",
  ) => void;
  chargeKrw: (amount: number, category: "PERSONAL" | "BUSINESS") => void;
  resetAccount: () => void;
  addTransaction: (tx: Transaction) => void;
}

export const SUPPORTED_CURRENCIES = [
  "KRW",
  "AED",
  "AUD",
  "BHD",
  "BND",
  "CAD",
  "CHF",
  "CNH",
  "DKK",
  "EUR",
  "GBP",
  "HKD",
  "IDR",
  "JPY",
  "KWD",
  "MYR",
  "NOK",
  "NZD",
  "SAR",
  "SEK",
  "SGD",
  "THB",
  "USD",
];

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [userId, setUserId] = useState<string>("guest");
  const [hasPersonalAccount, setHasPersonalAccount] = useState(false);
  const [personalAccount, setPersonalAccount] = useState("");
  const [personalBalances, setPersonalBalances] = useState<
    Record<string, number>
  >({});
  const [hasCorporateAccount, setHasCorporateAccount] = useState(false);
  const [corporateAccount, setCorporateAccount] = useState("");
  const [corporateBalances, setCorporateBalances] = useState<
    Record<string, number>
  >({});
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const sanitizeNumber = (val: any): number => {
    const num =
      typeof val === "number"
        ? val
        : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
    return isNaN(num) || num < 0 ? 0 : num;
  };

  const getInitialBalances = () =>
    SUPPORTED_CURRENCIES.reduce(
      (acc, cur) => ({ ...acc, [cur]: 0 }),
      {} as Record<string, number>,
    );

  const loadUserData = (id: string) => {
    const savedData = localStorage.getItem(`wallet_data_${id}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setHasPersonalAccount(parsed.hasPersonalAccount || false);
      setPersonalAccount(parsed.personalAccount || "");
      setPersonalBalances(parsed.personalBalances || getInitialBalances());
      setHasCorporateAccount(parsed.hasCorporateAccount || false);
      setCorporateAccount(parsed.corporateAccount || "");
      setCorporateBalances(parsed.corporateBalances || getInitialBalances());
      setTransactions(parsed.transactions || []);
    } else {
      setPersonalBalances(getInitialBalances());
      setCorporateBalances(getInitialBalances());
      setTransactions([]);
    }
  };

  useEffect(() => {
    const syncAuth = () => {
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
    syncAuth();
    const interval = setInterval(syncAuth, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (userId !== "guest") {
      localStorage.setItem(
        `wallet_data_${userId}`,
        JSON.stringify({
          hasPersonalAccount,
          personalAccount,
          personalBalances,
          hasCorporateAccount,
          corporateAccount,
          corporateBalances,
          transactions,
        }),
      );
    }
  }, [
    hasPersonalAccount,
    personalAccount,
    personalBalances,
    hasCorporateAccount,
    corporateAccount,
    corporateBalances,
    transactions,
    userId,
  ]);

  const chargeKrw = (amount: number, category: "PERSONAL" | "BUSINESS") => {
    const cleanAmount = sanitizeNumber(amount);
    if (cleanAmount <= 0) return;
    if (category === "PERSONAL") {
      setPersonalBalances((prev) => ({
        ...prev,
        KRW: (prev.KRW || 0) + cleanAmount,
      }));
    } else {
      setCorporateBalances((prev) => ({
        ...prev,
        KRW: (prev.KRW || 0) + cleanAmount,
      }));
    }
    setTransactions((prev) => [
      {
        id: `CHG-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: "CHARGE",
        category,
        title: `${category === "PERSONAL" ? "개인" : "기업"} 지갑 충전`,
        amount: cleanAmount,
        currency: "KRW",
        rate: 1,
        finalKrw: cleanAmount,
        status: "COMPLETED",
      },
      ...prev,
    ]);
  };

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
    const myBalances =
      category === "PERSONAL" ? personalBalances : corporateBalances;
    const myAccount =
      category === "PERSONAL" ? personalAccount : corporateAccount;
    if (toAccount === myAccount)
      throw new Error("본인 계좌로는 송금할 수 없습니다.");
    if ((myBalances.KRW || 0) < debitAmount)
      throw new Error("잔액이 부족합니다.");

    let targetUserKey = null;
    let targetCategory: "PERSONAL" | "BUSINESS" = "PERSONAL";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("wallet_data_")) {
        const other = JSON.parse(localStorage.getItem(key)!);
        if (other.personalAccount === toAccount) {
          targetUserKey = key;
          targetCategory = "PERSONAL";
          break;
        }
        if (other.corporateAccount === toAccount) {
          targetUserKey = key;
          targetCategory = "BUSINESS";
          break;
        }
      }
    }
    if (!targetUserKey) throw new Error("존재하지 않는 계좌번호입니다.");

    if (category === "PERSONAL")
      setPersonalBalances((prev) => ({
        ...prev,
        KRW: (prev.KRW || 0) - debitAmount,
      }));
    else
      setCorporateBalances((prev) => ({
        ...prev,
        KRW: (prev.KRW || 0) - debitAmount,
      }));

    const targetData = JSON.parse(localStorage.getItem(targetUserKey)!);
    const balKey =
      targetCategory === "PERSONAL" ? "personalBalances" : "corporateBalances";
    targetData[balKey].KRW = (targetData[balKey].KRW || 0) + creditAmount;
    targetData.transactions = [
      {
        id: `IN-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: "INCOMING",
        category: targetCategory,
        title: `입금 확인 (${myAccount})`,
        amount,
        currency,
        rate,
        finalKrw: creditAmount,
        status: "COMPLETED",
      },
      ...(targetData.transactions || []),
    ];
    localStorage.setItem(targetUserKey, JSON.stringify(targetData));

    setTransactions((prev) => [
      {
        id: `TX-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        type: "TRANSFER",
        category,
        title,
        amount: -amount,
        currency,
        rate,
        finalKrw: debitAmount,
        status: "COMPLETED",
      },
      ...prev,
    ]);
  };

  const resetAccount = () => {
    localStorage.removeItem(`wallet_data_${userId}`);
    window.location.reload();
  };

  return (
    <WalletContext.Provider
      value={{
        hasPersonalAccount,
        personalAccount,
        personalBalances,
        hasCorporateAccount,
        corporateAccount,
        corporateBalances,
        transactions,
        setPersonalAccount: (acc) => {
          setPersonalAccount(acc);
          setHasPersonalAccount(true);
        },
        setCorporateAccount: (acc) => {
          setCorporateAccount(acc);
          setHasCorporateAccount(true);
        },
        executeTransfer,
        chargeKrw,
        resetAccount,
        addTransaction: (tx) => setTransactions((prev) => [tx, ...prev]),
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
