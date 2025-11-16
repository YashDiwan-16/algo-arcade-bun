"use client";

import { useWallet } from "@txnlab/use-wallet-react";
import { useEffect, useState } from "react";
import algosdk from "algosdk";
import { getAlgodConfigFromEnvironment } from "@/utils/network/getAlgoClientConfigs";
import { Wallet } from "lucide-react";

export const Balance = () => {
  const { activeAddress } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeAddress) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoading(true);
      try {
        const algoConfig = getAlgodConfigFromEnvironment();
        const algodClient = new algosdk.Algodv2(
          algoConfig.token,
          algoConfig.server,
          algoConfig.port
        );

        const accountInfo = await algodClient
          .accountInformation(activeAddress)
          .do();

        // Convert microAlgos to Algos
        const algoBalance = Number(accountInfo.amount) / 1_000_000;
        setBalance(algoBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();

    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [activeAddress]);

  if (!activeAddress) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-sm font-medium">
      <Wallet className="h-4 w-4 text-muted-foreground" />
      <span className="text-muted-foreground">Balance:</span>
      <span className="font-mono font-semibold">
        {loading
          ? "..."
          : balance !== null
          ? `${balance.toFixed(4)} ALGO`
          : "Error"}
      </span>
    </div>
  );
};

export default Balance;
