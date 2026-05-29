"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, AlertTriangle, CheckCircle, TrendingUp, Search, MessageSquare, BarChart3, Shield } from "lucide-react";

export function DashboardPreviewSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-20 text-center">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Platform Preview
            <span className="w-8 h-px bg-foreground/30" />
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Powerful insights,
            <br />
            <span className="text-muted-foreground">intuitive interface.</span>
          </h2>
        </div>

        {/* Dashboard Preview */}
        <div 
          className={`relative transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          <div className="relative bg-foreground rounded-xl overflow-hidden shadow-2xl">
            {/* Browser Chrome */}
            <div className="px-4 py-3 border-b border-white/15 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-white/25" />
                <div className="w-3 h-3 rounded-full bg-white/25" />
                <div className="w-3 h-3 rounded-full bg-white/25" />
              </div>
              <div className="flex-1 mx-4">
                 <div className="bg-white/10 rounded-md px-4 py-1.5 text-xs text-white/70 font-mono max-w-md mx-auto">
                   app.contractsense.ai/dashboard
                 </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="bg-[#0a0a0a] p-6 text-white lg:p-8">
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Sidebar */}
                <div className="lg:col-span-2 hidden lg:block">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 rounded-lg bg-white/12 px-3 py-2 text-sm text-white">
                      <BarChart3 className="w-4 h-4" />
                      Dashboard
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 transition-colors hover:text-white/85">
                      <FileText className="w-4 h-4" />
                      Contracts
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 transition-colors hover:text-white/85">
                      <Search className="w-4 h-4" />
                      Analysis
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 transition-colors hover:text-white/85">
                      <MessageSquare className="w-4 h-4" />
                      AI Assistant
                    </div>
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-white/65 transition-colors hover:text-white/85">
                      <Shield className="w-4 h-4" />
                      Settings
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-10 space-y-6">
                  {/* Top Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Contracts Analyzed", value: "1,247", change: "+12%" },
                      { label: "Risks Identified", value: "89", change: "-8%" },
                      { label: "Hours Saved", value: "342", change: "+24%" },
                      { label: "Avg. Risk Score", value: "68", change: "-5%" },
                    ].map((stat, i) => (
                      <div key={i} className="rounded-lg border border-white/12 bg-white/6 p-4">
                        <p className="mb-1 text-xs text-white/65">{stat.label}</p>
                        <div className="flex items-end justify-between">
                          <span className="text-2xl font-display text-white">{stat.value}</span>
                          <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-amber-400'}`}>
                            {stat.change}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Grid */}
                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Contract List */}
                    <div className="overflow-hidden rounded-lg border border-white/12 bg-white/6 lg:col-span-2">
                      <div className="flex items-center justify-between border-b border-white/12 px-4 py-3">
                        <span className="text-sm font-medium text-white">Recent Contracts</span>
                        <span className="text-xs text-white/65">View all</span>
                      </div>
                      <div className="divide-y divide-white/10">
                        {[
                          { name: "Master Service Agreement - TechCorp", risk: "Medium", clauses: 147, status: "Analyzed" },
                          { name: "NDA - Acme Industries", risk: "Low", clauses: 23, status: "Analyzed" },
                          { name: "Software License - CloudBase", risk: "High", clauses: 89, status: "Review" },
                          { name: "Employment Contract - J. Smith", risk: "Low", clauses: 34, status: "Analyzed" },
                        ].map((contract, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded bg-white/12">
                                <FileText className="h-4 w-4 text-white/65" />
                              </div>
                              <div>
                                <p className="text-sm text-white">{contract.name}</p>
                                <p className="text-xs text-white/65">{contract.clauses} clauses</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 text-xs rounded ${
                                contract.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                                contract.risk === 'Medium' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-green-500/20 text-green-400'
                              }`}>
                                {contract.risk}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Assistant Panel */}
                    <div className="overflow-hidden rounded-lg border border-white/12 bg-white/6">
                      <div className="flex items-center gap-2 border-b border-white/12 px-4 py-3">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-sm font-medium text-white">AI Assistant</span>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-white/80">Indemnification clause in Section 8 is unusually broad</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-white/80">Standard confidentiality terms detected</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <TrendingUp className="w-4 h-4 text-background/50 mt-0.5 shrink-0" />
                            <p className="text-xs text-white/80">Payment terms favor counterparty by 15%</p>
                          </div>
                        </div>
                        <div className="border-t border-white/12 pt-3">
                          <div className="rounded-lg bg-white/12 px-3 py-2 text-xs text-white/55">
                            Ask about this contract...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Highlighted Contract Text */}
                  <div className="rounded-lg border border-white/12 bg-white/6 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-white">Clause Highlight</span>
                      <span className="text-xs text-white/65">Section 8.2 - Liability</span>
                    </div>
                    <div className="text-sm leading-relaxed text-white/85">
                      <span className="text-white/65">&quot;...The Service Provider shall indemnify and hold harmless the Client from </span>
                      <span className="bg-amber-500/20 text-amber-300 px-1 rounded">any and all claims, damages, losses, costs, and expenses</span>
                      <span className="text-white/65"> arising out of or related to the performance of services under this Agreement, </span>
                      <span className="bg-red-500/20 text-red-300 px-1 rounded">without limitation</span>
                      <span className="text-white/65">...&quot;</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded">Risk: Unlimited Liability</span>
                      <span className="text-xs text-white/65">Recommendation: Add liability cap</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow effect */}
          <div className="absolute -inset-4 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}
