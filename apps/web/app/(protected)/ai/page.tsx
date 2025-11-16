"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpSquare, Sparkles, Zap, Stars } from "lucide-react";
import { client } from "@/lib/orpc";
import { toast } from "sonner";
import { useSidebar } from "@/components/ui/sidebar";
import { Loader } from "@/components/ai-elements/loader";
import { gameTemplates } from "@/ai/templates";
import * as LucideIcons from "lucide-react";

export default function AIGameCreatorPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { isMobile, setOpen, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (isMobile) {
      setOpenMobile(false);
    } else {
      setOpen(true);
    }
  }, []);

  useEffect(() => {
    const textarea = document.getElementById(
      "description"
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [description]);




  
  const handleGenerate = async () => {
    if (description.length < 10) {
      toast.error(
        "Please provide a more detailed description (at least 10 characters)"
      );
      return;
    }

    setIsGenerating(true);

    try {
      const result = await client.ai.create({ description });

      toast.success("Game created successfully!");
      router.push(`/ai/${result.id}`);
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create game"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-linear-to-br from-background via-background to-muted/20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="relative container mx-auto max-w-6xl py-12 px-4 h-full flex items-center justify-center">
        <div className="w-full space-y-8 animate-in fade-in duration-700">
          {/* Header Section */}
          <div className="text-center space-y-4 relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm mb-4 animate-in slide-in-from-top duration-500">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                AI-Powered Game Creation
              </span>
              <Zap className="w-4 h-4 text-primary animate-pulse delay-150" />
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight animate-in slide-in-from-top duration-700 delay-100">
              <span className="bg-linear-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent">
                Create Your Game
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in slide-in-from-top duration-700 delay-200">
              Describe your vision and watch as AI transforms your ideas into
              interactive experiences.
              <span className="hidden md:inline">
                {" "}
                Be specific about mechanics, style, and features.
              </span>
            </p>
          </div>

          {/* Main Input Card */}
          <div className="max-w-3xl mx-auto animate-in zoom-in duration-700 delay-300">
            <div className="relative group">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-linear-to-r from-primary via-purple-500 to-pink-500 rounded-2xl opacity-20 group-hover:opacity-30 blur-xl transition-all duration-500" />

              <div className="relative bg-card/80 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 hover:border-primary/30">
                {/* Input Area */}
                <div className="p-6 space-y-4">
                  <div className="relative flex items-end gap-3 rounded-xl border-2 border-border bg-background/50 backdrop-blur-sm p-3 focus-within:border-primary/50 focus-within:shadow-lg focus-within:shadow-primary/10 transition-all duration-300">
                    <textarea
                      id="description"
                      placeholder="✨ Describe your dream game... (e.g., A fast-paced space shooter with neon graphics, where players dodge asteroids using arrow keys...)"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          if (!isGenerating && description.length >= 10) {
                            handleGenerate();
                          }
                        }
                      }}
                      rows={1}
                      className="flex-1 bg-transparent px-3 py-3 text-base resize-none focus:outline-none placeholder:text-muted-foreground/60 max-h-[200px] min-h-12"
                      style={{
                        height: "auto",
                        overflowY: description.length > 100 ? "auto" : "hidden",
                      }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + "px";
                      }}
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating || description.length < 10}
                      className="relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 bg-linear-to-r from-primary via-purple-600 to-pink-600 hover:shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95 h-12 w-12 shrink-0 text-white group"
                      title={isGenerating ? "Generating..." : "Generate Game"}
                    >
                      {isGenerating ? (
                        <Loader className="h-6 w-6" />
                      ) : (
                        <>
                          <ArrowUpSquare className="h-6 w-6 transition-transform group-hover:-translate-y-0.5" />
                          <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Character Counter */}
                  <div className="flex items-center justify-between px-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">
                        {description.length} characters
                      </span>
                      {description.length >= 10 ? (
                        <span className="inline-flex items-center gap-1 text-green-500 font-medium">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Ready
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60">
                          (minimum 10)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          {description.length === 0 && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 delay-500">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="h-px w-12 bg-linear-to-r from-transparent to-border" />
                  <Stars
                    className="w-4 h-4 text-primary animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                  <span className="text-sm font-semibold text-muted-foreground">
                    Popular Templates
                  </span>
                  <Stars
                    className="w-4 h-4 text-primary animate-spin"
                    style={{
                      animationDuration: "8s",
                      animationDirection: "reverse",
                    }}
                  />
                  <div className="h-px w-12 bg-linear-to-l from-transparent to-border" />
                </div>
                <p className="text-muted-foreground">
                  Jump-start your creativity with these pre-made game concepts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameTemplates.slice(0, 6).map((template, index) => {
                  const IconComponent = ((
                    LucideIcons as unknown as Record<
                      string,
                      React.ComponentType<{ className: string }>
                    >
                  )[template.icon] ||
                    LucideIcons.Gamepad2) as React.ComponentType<{
                    className: string;
                  }>;
                  return (
                    <button
                      key={template.id}
                      onClick={() => setDescription(template.prompt)}
                      className="group cursor-pointer relative p-5 rounded-2xl border-2 border-border bg-card/50 backdrop-blur-sm hover:bg-card hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 text-left overflow-hidden hover:-translate-y-1 active:translate-y-0"
                      style={{
                        animationDelay: `${index * 100}ms`,
                      }}
                    >
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative flex items-start gap-4">
                        <div className="shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base mb-1.5 group-hover:text-primary transition-colors line-clamp-1">
                            {template.name}
                          </h4>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                          <ArrowUpSquare className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      {/* Shimmer effect */}
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/10 to-transparent" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
