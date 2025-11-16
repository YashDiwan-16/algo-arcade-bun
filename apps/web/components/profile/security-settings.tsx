"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Monitor,
  Smartphone,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SecuritySettingsProps {
  userId: string;
}

export function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const {
    data: sessions = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["sessions", userId],
    queryFn: async () => {
      const response = await authClient.listSessions();
      return response.data || [];
    },
  });

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await authClient.revokeSession({
        token: sessionId,
      });
      toast.success("Session revoked successfully");
      refetch();
    } catch (error) {
      console.error("Revoke session error:", error);
      toast.error("Failed to revoke session");
    }
  };

  const handleRevokeAll = async () => {
    setIsRevokingAll(true);
    try {
      await authClient.revokeOtherSessions();
      toast.success("All other sessions revoked successfully");
      refetch();
    } catch (error) {
      console.error("Revoke all sessions error:", error);
      toast.error("Failed to revoke sessions");
    } finally {
      setIsRevokingAll(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return Monitor;
    if (
      userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone")
    ) {
      return Smartphone;
    }
    return Monitor;
  };

  const getDeviceType = (userAgent?: string) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Mobile")) return "Mobile";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone")) return "iPhone";
    if (userAgent.includes("iPad")) return "iPad";
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "Mac";
    if (userAgent.includes("Linux")) return "Linux";
    return "Unknown Device";
  };

  const getBrowser = (userAgent?: string) => {
    if (!userAgent) return "Unknown Browser";
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown Browser";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <div>
              <CardTitle>Security & Sessions</CardTitle>
              <CardDescription>
                Manage your active sessions and security settings
              </CardDescription>
            </div>
          </div>
          {sessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={isRevokingAll}
                >
                  {isRevokingAll ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Revoking...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Revoke All Sessions
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of all devices except this one. You
                    will need to sign in again on those devices.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAll}>
                    Revoke All Sessions
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active sessions found
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <p className="text-sm text-muted-foreground">
                You have {sessions.length} active{" "}
                {sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>

            {sessions.map((session, index) => {
              const DeviceIcon = getDeviceIcon(session.userAgent ?? undefined);
              const isCurrentSession = index === 0; // Assuming first session is current

              return (
                <div key={session.id}>
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <div className="mt-1">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">
                          {getDeviceType(session.userAgent ?? undefined)} ·{" "}
                          {getBrowser(session.userAgent ?? undefined)}
                        </h4>
                        {isCurrentSession && (
                          <Badge
                            variant="outline"
                            className="border-green-500 text-green-600"
                          >
                            Current Session
                          </Badge>
                        )}
                      </div>
                      <div className="grid gap-1 text-sm text-muted-foreground">
                        {session.ipAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            <span>{session.ipAddress}</span>
                          </div>
                        )}
                        {session.createdAt && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>
                              Active since {formatDate(session.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!isCurrentSession && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Revoke this session?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will sign out this device. You will need to
                              sign in again to access your account from that
                              device.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRevokeSession(session.id)}
                            >
                              Revoke Session
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  {index < sessions.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <Separator />

        <div className="space-y-4">
          <h3 className="font-medium">Security Recommendations</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Use a strong, unique password for your account</p>
            </div>
            <div className="flex gap-2">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Enable two-factor authentication for extra security</p>
            </div>
            <div className="flex gap-2">
              <Shield className="h-4 w-4 mt-0.5 shrink-0" />
              <p>Review active sessions regularly and revoke unknown devices</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
