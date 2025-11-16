"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import {
  Send,
  Play,
  Code,
  History,
  Upload,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { client } from "@/lib/orpc";
import { toast } from "sonner";
import Link from "next/link";
import LoadingScreen from "@/components/layout/loading";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { Loader } from "@/components/ai-elements/loader";

// Dynamically import Monaco Editor to avoid SSR issues
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <LoadingScreen />
    </div>
  ),
});

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIGameEditorPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.id as string;
  const queryClient = useQueryClient();
  const { setOpen, setOpenMobile, isMobile } = useSidebar();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showVersions, setShowVersions] = useState(false);
  const [editedCode, setEditedCode] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [publishTitle, setPublishTitle] = useState("");

  // Close sidebar initially when component mounts (but allow user to reopen it)
  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps array - only run once on mount

  // Fetch game data
  const { data: game, isLoading } = useQuery({
    queryKey: ["ai-game", gameId],
    queryFn: async () => {
      return await client.ai.get({ id: gameId });
    },
  });

  // Code to display (prefer edited code, fallback to game code)
  const displayCode = editedCode ?? game?.code ?? "";

  // Handle code changes in Monaco editor
  const handleCodeChange = (value: string | undefined) => {
    if (value === undefined) return;

    setEditedCode(value);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce: Update preview after 500ms of no typing
    debounceTimerRef.current = setTimeout(() => {
      // The preview will automatically update since it uses displayCode
      // We could add auto-save here if needed
    }, 500);
  };

  // Reset edited code when game data changes from AI improvements
  useEffect(() => {
    if (game?.code && editedCode === null) {
      // Only reset on initial load
      return;
    }
  }, [game?.code, editedCode]);

  // Improve game mutation
  const improveMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return await client.ai.improve({ id: gameId, prompt });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai-game", gameId] });

      // Reset edited code to show AI-generated version
      setEditedCode(null);

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `I've updated your game! Version ${data.version} is now active.`,
          timestamp: new Date(),
        },
      ]);

      toast.success(`Updated to version ${data.version}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to improve game");
    },
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (version: number) => {
      return await client.ai.restoreVersion({ id: gameId, version });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["ai-game", gameId] });
      // Reset edited code to show restored version
      setEditedCode(null);
      toast.success(`Restored to version ${data.version}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to restore version");
    },
  });

  // Publish game mutation
  const publishMutation = useMutation({
    mutationFn: async (title: string) => {
      return await client.ai.publish({ id: gameId, title });
    },
    onSuccess: () => {
      toast.success("Game published to arena!");
      queryClient.invalidateQueries({ queryKey: ["ai-game", gameId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to publish game");
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Call improve API
    improveMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleRestoreVersion = (version: number) => {
    restoreVersionMutation.mutate(version);
  };

  const handlePublish = () => {
    setPublishTitle(game?.title || "");
    setShowPublishDialog(true);
  };

  const handleConfirmPublish = () => {
    if (publishTitle.trim()) {
      publishMutation.mutate(publishTitle);
      setShowPublishDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg text-muted-foreground">Game not found</p>
        <Button onClick={() => router.push("/ai")}>Create New Game</Button>
      </div>
    );
  }

  return (
    <>
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Game to Arena</AlertDialogTitle>
            <AlertDialogDescription>
              Enter a title for your game. This will be visible to all players
              in the arena.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter game title..."
              value={publishTitle}
              onChange={(e) => setPublishTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleConfirmPublish();
                }
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmPublish}
              disabled={!publishTitle.trim()}
            >
              Publish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-full flex overflow-hidden bg-background">
        {/* Left Panel - AI Chat & Controls (25%) */}
        <div className="w-[25%] flex flex-col border-r bg-muted/30">
          {/* Compact Header with Controls */}
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center gap-2 mb-3">
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <Link href="/ai">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h1 className="text-sm font-bold truncate">{game.title}</h1>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    <Zap className="h-2.5 w-2.5 mr-1" />v{game.currentVersion}
                  </Badge>
                  {game.published ? (
                    <Badge className="text-xs px-1.5 py-0">Live</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      Draft
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Publish Button */}
            {!game.published && (
              <Button
                onClick={handlePublish}
                disabled={publishMutation.isPending}
                className="w-full"
                size="sm"
              >
                {publishMutation.isPending ? (
                  <>
                    <Loader size={14} className="mr-2" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-3.5 w-3.5" />
                    Publish to Arena
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Version History - Collapsible */}
          <div className="border-b">
            <Button
              variant="ghost"
              onClick={() => setShowVersions(!showVersions)}
              className="w-full justify-between px-4 py-3 rounded-none"
            >
              <div className="flex items-center gap-2">
                <History className="h-4 w-4" />
                <span className="text-sm font-semibold">Version History</span>
                <Badge variant="secondary" className="text-xs">
                  {game.versions.length}
                </Badge>
              </div>
              {showVersions ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>

            {showVersions && game.versions.length > 0 && (
              <div className="px-3 pb-3 bg-muted/20">
                <ScrollArea className="h-48">
                  <div className="space-y-2 pr-2">
                    {game.versions.map((version) => (
                      <div
                        key={version.version}
                        className={`rounded-lg border p-3 transition-all ${
                          version.version === game.currentVersion
                            ? "bg-primary/5 border-primary/20"
                            : "bg-card hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-2.5 w-2.5 mr-1" />v
                              {version.version}
                            </Badge>
                            {version.version === game.currentVersion && (
                              <Badge className="text-xs">Active</Badge>
                            )}
                          </div>
                          {version.version !== game.currentVersion && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRestoreVersion(version.version)
                              }
                              disabled={restoreVersionMutation.isPending}
                              className="h-6 px-2 text-xs"
                            >
                              Restore
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {version.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          {/* AI Assistant Header */}
          <div className="px-4 py-3 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold">AI Assistant</h2>
            </div>
          </div>

          {/* Messages */}
          <Conversation className="flex-1">
            <ConversationContent>
              {messages.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-sm font-semibold mb-2">
                    Enhance Your Game
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    Tell me how to improve your game:
                  </p>
                  <Suggestions className="justify-center">
                    <Suggestion
                      suggestion="Add a score system"
                      onClick={(s) => setInputMessage(s)}
                    />
                    <Suggestion
                      suggestion="Make enemies faster"
                      onClick={(s) => setInputMessage(s)}
                    />
                    <Suggestion
                      suggestion="Add power-ups"
                      onClick={(s) => setInputMessage(s)}
                    />
                  </Suggestions>
                </div>
              )}
              {messages.map((message, index) => (
                <Message key={index} from={message.role}>
                  <MessageContent>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </MessageContent>
                </Message>
              ))}
              {improveMutation.isPending && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <Loader size={16} />
                      <span className="text-xs text-muted-foreground">
                        Processing your request...
                      </span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          {/* Input */}
          <div className="p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <Input
                placeholder="Describe your improvement..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={improveMutation.isPending}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || improveMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Panel - Preview & Code Editor (75%) */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="preview" className="flex-1 flex flex-col">
            <div className="border-b px-6">
              <TabsList>
                <TabsTrigger value="preview" className="gap-2">
                  <Play className="h-4 w-4" />
                  Live Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2">
                  <Code className="h-4 w-4" />
                  Source Code
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="preview" className="flex-1 m-0 p-0">
              <div className="h-full bg-black">
                <iframe
                  key={displayCode}
                  srcDoc={displayCode}
                  className="w-full h-full border-0"
                  title="Game Preview"
                  sandbox="allow-scripts"
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="flex-1 m-0 p-0">
              <MonacoEditor
                height="100%"
                language="html"
                value={displayCode}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  readOnly: false,
                  minimap: { enabled: true },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "on",
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
