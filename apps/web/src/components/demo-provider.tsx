"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DEMO_CAPACITY_CENTS } from "@/lib/demo";
type Loan = {
  principal: number;
  due: number;
  purpose: string;
  status: "Active" | "Repaid";
};
type State = {
  operator: string;
  region: string;
  loan: Loan | null;
  allocations: Record<string, number>;
  connected: boolean;
};
const initial: State = {
  operator: "Meridian Compute",
  region: "Lagos, Nigeria",
  loan: null,
  allocations: {},
  connected: false,
};
const Context = createContext<{
  state: State;
  ready: boolean;
  storageError: string;
  update: (patch: Partial<State>) => void;
  borrow: (amount: number, purpose: string) => boolean;
  repay: () => void;
  allocate: (id: string, amount: number, cap: number) => boolean;
  reset: () => void;
} | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nodra-demo-v1");
      if (raw) {
        const p = JSON.parse(raw);
        const validAmount = (v: unknown) =>
          typeof v === "number" && Number.isSafeInteger(v) && v >= 0;
        const loanValid =
          p.loan === null ||
          (p.loan &&
            validAmount(p.loan.principal) &&
            p.loan.principal <= DEMO_CAPACITY_CENTS &&
            validAmount(p.loan.due) &&
            typeof p.loan.purpose === "string" &&
            ["Active", "Repaid"].includes(p.loan.status));
        if (
          typeof p.operator === "string" &&
          typeof p.region === "string" &&
          typeof p.connected === "boolean" &&
          loanValid &&
          p.allocations &&
          Object.values(p.allocations).every(validAmount)
        )
          setState(p);
      }
    } catch {
      setStorageError(
        "Saved demo data could not be read. This session starts fresh.",
      );
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("nodra-demo-v1", JSON.stringify(state));
      } catch {
        setStorageError(
          "Browser storage is unavailable. Changes last for this session only.",
        );
      }
  }, [state, ready]);
  function update(patch: Partial<State>) {
    setState((s) => ({ ...s, ...patch }));
  }
  function borrow(amount: number, purpose: string) {
    if (
      !state.connected ||
      !Number.isSafeInteger(amount) ||
      amount < 10000 ||
      amount > DEMO_CAPACITY_CENTS ||
      state.loan?.status === "Active"
    )
      return false;
    update({
      loan: {
        principal: amount,
        due: amount + Math.round((amount * 300) / 10000),
        purpose,
        status: "Active",
      },
    });
    return true;
  }
  function repay() {
    if (state.loan)
      update({ loan: { ...state.loan, status: "Repaid", due: 0 } });
  }
  function allocate(id: string, amount: number, cap: number) {
    const total = Object.values(state.allocations).reduce((a, b) => a + b, 0);
    if (
      !state.connected ||
      !Number.isSafeInteger(amount) ||
      amount < 10000 ||
      amount > 2500000 - total ||
      amount > cap - (state.allocations[id] || 0)
    )
      return false;
    update({
      allocations: {
        ...state.allocations,
        [id]: (state.allocations[id] || 0) + amount,
      },
    });
    return true;
  }
  return (
    <Context.Provider
      value={{
        state,
        ready,
        storageError,
        update,
        borrow,
        repay,
        allocate,
        reset: () => setState(initial),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("Missing demo provider");
  return value;
}
