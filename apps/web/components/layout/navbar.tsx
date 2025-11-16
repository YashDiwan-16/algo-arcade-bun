"use client";

import { AnimatedThemeToggler } from "../theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Copy, LogIn, LogOut, Shield, User, Wallet } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ConnectWallet from "@/components/algorand/ConnectWallet";
import { useWallet } from "@txnlab/use-wallet-react";
import { useState, useEffect } from "react";
import { ellipseAddress } from "@/utils/ellipseAddress";
import algosdk from "algosdk";
import { getAlgodConfigFromEnvironment } from "@/utils/network/getAlgoClientConfigs";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { activeAddress, wallets } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [openWalletModal, setOpenWalletModal] = useState(false);

  // Fetch balance when wallet is connected
  useEffect(() => {
    if (!activeAddress) {
      setBalance(null);
      return;
    }

    const fetchBalance = async () => {
      setLoadingBalance(true);
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
        setLoadingBalance(false);
      }
    };

    fetchBalance();

    // Refresh balance every 10 seconds
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [activeAddress]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isAdmin =
    session?.user?.role === "admin" || session?.user?.role === "super-admin";

  const handleCopyAddress = async () => {
    if (!activeAddress) {
      return;
    }
    try {
      await navigator.clipboard.writeText(activeAddress);
      setIsCopying(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setIsCopying(false), 2000);
    } catch {
      toast.error("Failed to copy address");
    }
  };

  const handleLogout = async () => {
    if (wallets.length > 0) {
      const activeWallet = wallets.find((w) => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
        toast.success("Wallet disconnected");
        return;
      }
    }
    localStorage.removeItem("@txnlab/use-wallet:v3");
    window.location.reload();
  };
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2">
          {session && <SidebarTrigger />}
          {!session && (
            <Link href="/">
              <h1 className="text-base sm:text-lg font-bold">Algo Games</h1>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <AnimatedThemeToggler />

          {/* Wallet Dropdown - Combined Balance + Connect/Disconnect */}
          {!activeAddress ? (
            <Button
              onClick={() => setOpenWalletModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Connect Wallet</span>
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 font-mono">
                  <Wallet className="h-4 w-4" />
                  <span className="hidden sm:inline">
                    {loadingBalance
                      ? "..."
                      : balance !== null
                      ? `${balance.toFixed(2)} ALGO`
                      : "Error"}
                  </span>
                  <span className="sm:hidden">
                    {ellipseAddress(activeAddress)}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-mono">
                      {ellipseAddress(activeAddress)}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyAddress}>
                  <Copy className="mr-2 h-4 w-4" />
                  {isCopying ? "Copied!" : "Copy address"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* User Authentication Dropdown */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user?.image || undefined}
                      alt={session.user?.name || "User"}
                    />
                    <AvatarFallback>
                      {getInitials(session.user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                    {session.user?.role && (
                      <p className="text-xs leading-none text-muted-foreground">
                        Role: {session.user.role}
                      </p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/profile")}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => router.push("/admin")}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/sign-in")}
              className="gap-2"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Button>
          )}
        </div>
      </div>
      <ConnectWallet
        closeModal={() => setOpenWalletModal(false)}
        openModal={openWalletModal}
      />
    </nav>
  );
}
