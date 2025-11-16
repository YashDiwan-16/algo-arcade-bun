"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  Sparkles,
  Gamepad2,
  Crown,
  Rocket,
  ShieldCheck,
  Zap,
  Coins,
  Check,
  ArrowRight,
} from "lucide-react";

// Static pricing config – backend enforcement should mirror these values
const TIERS = [
  {
    id: "free",
    name: "Free",
    badge: "Starter",
    priceLabel: "0 ALGO",
    priceValue: 0,
    generations: 5,
    highlight: false,
    cta: "Get Started",
    href: "/auth/sign-in",
    gradient:
      "from-gray-100 via-purple-50 to-white dark:from-gray-900 dark:via-purple-950/40 dark:to-gray-900",
    features: [
      "Access AI Game Studio",
      "Publish Draft Games",
      "Community Play",
      "Basic Analytics",
    ],
  },
  {
    id: "explorer",
    name: "Explorer",
    badge: "Popular",
    priceLabel: "2 ALGO",
    priceValue: 2,
    generations: 20,
    highlight: true,
    cta: "Upgrade (2 ALGO)",
    href: "/pricing/checkout?plan=explorer",
    gradient: "from-purple-600 via-pink-600 to-blue-600",
    features: [
      "Everything in Free",
      "Priority Generation Queue",
      "Enhanced Game Analytics",
      "Early Feature Access",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Power",
    priceLabel: "5 ALGO",
    priceValue: 5,
    generations: 50,
    highlight: false,
    cta: "Upgrade (5 ALGO)",
    href: "/pricing/checkout?plan=pro",
    gradient:
      "from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30",
    features: [
      "Everything in Explorer",
      "Priority Support",
      "Advanced Publishing Controls",
      "Extended Asset Library",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-purple-50/30 to-white dark:from-gray-950 dark:via-purple-950/30 dark:to-gray-950">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-24 right-24 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/15 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-32 left-20 w-96 h-96 bg-pink-300/20 dark:bg-pink-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "800ms" }}
        />
        <div
          className="absolute top-1/2 left-1/2 w-72 h-72 bg-blue-300/20 dark:bg-blue-600/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1600ms" }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20">
        {/* Header */}
        <div className="text-center space-y-6 mb-16 opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Pricing & Plans
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight">
            <span className="block bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent bg-size-[200%_auto] animate-[gradient_8s_ease_infinite]">
              Choose Your Journey
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Unlock more AI-powered game generations & creator features. Simple
            Algorand micro-payments, no subscriptions.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {TIERS.map((tier, idx) => (
            <Card
              key={tier.id}
              className={`relative overflow-hidden border-2 transition-all duration-500 group ${
                tier.highlight
                  ? "border-purple-400 shadow-xl shadow-purple-500/30 scale-105"
                  : "border-gray-200 dark:border-gray-800"
              } hover:shadow-2xl hover:-translate-y-2 hover:border-purple-300 dark:hover:border-purple-700`}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                  tier.highlight
                    ? "from-purple-500/20 via-pink-500/20 to-blue-500/20"
                    : "from-purple-500/10 via-pink-500/10 to-blue-500/10"
                }`}
              />
              <CardContent className="relative p-8 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-3xl font-black mb-2 tracking-tight bg-clip-text text-transparent bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-300 dark:via-pink-300 dark:to-blue-300">
                      {tier.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          tier.highlight
                            ? "bg-purple-600/10 text-purple-600 dark:text-purple-300 border-purple-500/30"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20"
                        }`}
                      >
                        {tier.badge}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {tier.generations} generations
                      </Badge>
                    </div>
                  </div>
                  {tier.highlight ? (
                    <Crown className="w-10 h-10 text-yellow-500 drop-shadow" />
                  ) : (
                    <Gamepad2 className="w-10 h-10 text-purple-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {tier.priceLabel}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {tier.generations} AI game generations included
                  </p>
                </div>

                <Separator className="bg-gray-200 dark:bg-gray-800" />

                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full font-bold group ${
                    tier.highlight
                      ? "bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/30"
                      : "bg-white text-purple-600 border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 dark:bg-gray-900 dark:text-purple-300 dark:border-purple-800 dark:hover:border-purple-600"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Algorand Section */}
        <div className="mt-24 opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
          <div className="text-center space-y-4 mb-12">
            <Badge
              variant="outline"
              className="px-4 py-1 text-sm font-semibold border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300"
            >
              Why Algorand?
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white">
              Fast • Green • Low-Cost
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We use Algorand micro-payments to unlock higher generation tiers.
              No lock-in subscriptions – just scalable on-demand creativity.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                title: "Micro-Payments",
                desc: "Pay only when you need more generations",
              },
              {
                icon: ShieldCheck,
                title: "Secure",
                desc: "On-chain verification for upgrades",
              },
              {
                icon: Rocket,
                title: "Scalable",
                desc: "Progressively unlock advanced creator power",
              },
            ].map((item, i) => (
              <Card
                key={item.title}
                className="relative overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-6 relative space-y-3">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-32 text-center space-y-6 p-8 rounded-3xl bg-linear-to-r from-purple-600 via-pink-600 to-blue-600 shadow-2xl shadow-purple-500/30 opacity-0 animate-[fadeIn_0.8s_ease-out_0.6s_forwards]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            Ready to build more?
          </h2>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto">
            Upgrade your tier and unlock additional AI game generations today.
          </p>
          <Link href="/ai">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 text-base font-bold"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Create a Game
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
