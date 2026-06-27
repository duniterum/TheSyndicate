import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Density = "comfortable" | "compact";

interface AppContextType {
  // Wallet / session (prototype, simulated)
  isConnected: boolean;
  setIsConnected: (v: boolean) => void;
  connect: () => void;
  disconnect: () => void;

  // Seat status demo mode — preview seated vs connected-but-not-seated
  isSeated: boolean;
  setIsSeated: (v: boolean) => void;

  // Founder / operator demo mode — gates Founder Console + founder-only UI
  isFounder: boolean;
  setFounder: (v: boolean) => void;

  // Appearance
  theme: "light" | "dark";
  toggleTheme: () => void;
  density: Density;
  setDensity: (d: Density) => void;
  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  // Security / privacy (prototype preferences)
  highSecurity: boolean;
  setHighSecurity: (v: boolean) => void;
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
  maskAddress: boolean;
  setMaskAddress: (v: boolean) => void;

  // Notifications (prototype preferences)
  notifyEvolution: boolean;
  setNotifyEvolution: (v: boolean) => void;
  notifyReceipts: boolean;
  setNotifyReceipts: (v: boolean) => void;

  // Prototype / data controls
  showCanonical: boolean;
  setShowCanonical: (v: boolean) => void;
  resetDemo: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function usePersistentBool(key: string, initial: boolean) {
  const [value, setValue] = useState<boolean>(() => {
    const stored = localStorage.getItem(key);
    return stored === null ? initial : stored === "true";
  });
  useEffect(() => {
    localStorage.setItem(key, String(value));
  }, [key, value]);
  return [value, setValue] as const;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = usePersistentBool("syn-connected", false);
  const [isSeated, setIsSeated] = usePersistentBool("syn-seated", true);
  const [isFounder, setFounder] = usePersistentBool("syn-founder", false);

  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "dark"
  );
  const [density, setDensity] = useState<Density>(
    () => (localStorage.getItem("syn-density") as Density) || "comfortable"
  );
  const [reducedMotion, setReducedMotion] = usePersistentBool("syn-reduced-motion", false);

  const [highSecurity, setHighSecurity] = usePersistentBool("syn-high-security", false);
  const [hideBalance, setHideBalance] = usePersistentBool("syn-hide-balance", false);
  const [maskAddress, setMaskAddress] = usePersistentBool("syn-mask-address", false);

  const [notifyEvolution, setNotifyEvolution] = usePersistentBool("syn-notify-evolution", true);
  const [notifyReceipts, setNotifyReceipts] = usePersistentBool("syn-notify-receipts", true);

  const [showCanonical, setShowCanonical] = usePersistentBool("syn-show-canonical", true);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("syn-density", density);
    document.documentElement.dataset.density = density;
  }, [density]);

  useEffect(() => {
    document.documentElement.dataset.reducedMotion = String(reducedMotion);
  }, [reducedMotion]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  const connect = () => setIsConnected(true);
  const disconnect = () => setIsConnected(false);

  const resetDemo = () => {
    setIsSeated(true);
    setFounder(false);
    setHighSecurity(false);
    setHideBalance(false);
    setMaskAddress(false);
    setReducedMotion(false);
    setDensity("comfortable");
    setNotifyEvolution(true);
    setNotifyReceipts(true);
    setShowCanonical(true);
  };

  return (
    <AppContext.Provider
      value={{
        isConnected,
        setIsConnected,
        connect,
        disconnect,
        isSeated,
        setIsSeated,
        isFounder,
        setFounder,
        theme,
        toggleTheme,
        density,
        setDensity,
        reducedMotion,
        setReducedMotion,
        highSecurity,
        setHighSecurity,
        hideBalance,
        setHideBalance,
        maskAddress,
        setMaskAddress,
        notifyEvolution,
        setNotifyEvolution,
        notifyReceipts,
        setNotifyReceipts,
        showCanonical,
        setShowCanonical,
        resetDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within an AppProvider");
  return context;
}
