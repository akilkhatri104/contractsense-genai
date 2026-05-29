"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, FileText, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const words = ["extract", "analyze", "protect", "simplify"];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-30 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div
          className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            AI-Powered Contract Intelligence
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          <h1
            className={`text-[clamp(2.5rem,10vw,7rem)] font-display leading-[0.95] tracking-tight transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
          >
            <span className="block">Understand contracts</span>
            <span className="block">
              instantly.{" "}
              <span className="relative inline-block">
                <span
                  key={wordIndex}
                  className="inline-flex text-muted-foreground"
                >
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-foreground/5" />
              </span>
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p
            className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            Extract clauses, simplify legal language, identify risks, and understand contracts instantly using advanced AI.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
          >
            <Show when="signed-out">
              <SignUpButton>
                <Button
                  size="lg"
                  className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
                >
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Button
                size="lg"
                className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
                asChild
              >
                <Link href="/contracts">
                  Open Contract Workspace
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </Show>
            <Show when="signed-out">
              <SignInButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5 group"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5 group"
                asChild
              >
                <Link href="/contracts">
                  <Play className="w-4 h-4 mr-2" />
                  Go to contracts
                </Link>
              </Button>
            </Show>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div
          className={`mt-20 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
            }`}
        >
          <div className="relative bg-foreground/[0.02] border border-foreground/10 rounded-xl p-6 lg:p-8 overflow-hidden">
            {/* Glassmorphism effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />

            <div className="relative grid lg:grid-cols-3 gap-6">
              {/* Contract Upload Card */}
              <div className="bg-background border border-foreground/10 rounded-lg p-5 hover:border-foreground/20 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-foreground/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Service Agreement.pdf</p>
                    <p className="text-xs text-muted-foreground">Uploaded 2 min ago</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Analysis Progress</span>
                    <span className="text-foreground">87%</span>
                  </div>
                  <div className="h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-foreground rounded-full" />
                  </div>
                </div>
              </div>

              {/* Risk Score Card */}
              <div className="bg-background border border-foreground/10 rounded-lg p-5 hover:border-foreground/20 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Risk Assessment</span>
                  <span className="px-2 py-1 bg-amber-500/10 text-amber-600 text-xs font-mono rounded">Medium</span>
                </div>
                <div className="flex items-end gap-4">
                  <span className="text-4xl font-display">72</span>
                  <div className="flex-1 flex items-end gap-1 h-12 pb-1">
                    {[40, 65, 45, 80, 55, 72].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-foreground/20 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">3 clauses require attention</p>
              </div>

              {/* AI Insights Card */}
              <div className="bg-background border border-foreground/10 rounded-lg p-5 hover:border-foreground/20 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">AI Insights</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">Liability cap missing in Section 8</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">Standard termination clause detected</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-foreground/70 mt-0.5 shrink-0" />
                    <p className="text-xs text-muted-foreground">Payment terms favor counterparty</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Stats marquee - full width outside container */}
      <div
        className={`absolute bottom-16 left-0 right-0 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"
          }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {[
                { value: "50K+", label: "contracts analyzed", company: "LAW FIRMS" },
                { value: "92%", label: "risk detection accuracy", company: "ENTERPRISES" },
                { value: "10x", label: "faster review cycles", company: "STARTUPS" },
                { value: "4.9", label: "customer rating", company: "G2 CROWD" },
              ].map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-xs mt-1">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
