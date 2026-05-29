"use client";

import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, FileCheck, Server, Key } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "SOC 2 Type II Certified",
    description: "Independently audited security controls with continuous monitoring and compliance verification.",
  },
  {
    icon: Lock,
    title: "End-to-end encryption",
    description: "AES-256 encryption for documents at rest and TLS 1.3 for all data in transit.",
  },
  {
    icon: Eye,
    title: "Privacy-first AI",
    description: "Your documents are never used to train our models. Complete data isolation guaranteed.",
  },
  {
    icon: FileCheck,
    title: "Compliance ready",
    description: "Full support for GDPR, HIPAA, and industry-specific compliance requirements.",
  },
  {
    icon: Server,
    title: "Secure infrastructure",
    description: "Hosted on enterprise-grade infrastructure with 99.99% uptime SLA.",
  },
  {
    icon: Key,
    title: "Access controls",
    description: "Granular role-based permissions and SSO integration for enterprise teams.",
  },
];

const certifications = ["SOC 2", "ISO 27001", "HIPAA", "GDPR", "CCPA", "BAA"];

export function SecuritySection() {
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
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 mb-16">
          {/* Left: Content */}
          <div
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
              <span className="w-8 h-px bg-foreground/30" />
              Security
            </span>
            <h2 className="text-4xl lg:text-6xl font-display tracking-tight mb-8">
              Your contracts
              <br />
              deserve protection.
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Legal documents contain your most sensitive business information. 
              Our enterprise-grade security ensures they stay protected at every step.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 border border-foreground/10 text-sm font-mono transition-all duration-500 hover:bg-foreground hover:text-background ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{ transitionDelay: `${index * 50 + 200}ms` }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Shield Animation */}
          <div 
            className={`flex items-center justify-center transition-all duration-1000 ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
          >
            <div className="relative">
              <svg viewBox="0 0 200 240" className="w-48 h-60 text-foreground">
                <defs>
                  <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                <path
                  d="M 100 20 L 180 50 L 180 120 Q 180 190 100 220 Q 20 190 20 120 L 20 50 Z"
                  fill="url(#shieldGradient)"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M 100 40 L 160 62 L 160 115 Q 160 170 100 195 Q 40 170 40 115 L 40 62 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  opacity="0.3"
                />
                <rect x="78" y="95" width="44" height="36" rx="4" fill="currentColor" />
                <path
                  d="M 86 95 L 86 80 Q 86 65 100 65 Q 114 65 114 80 L 114 95"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <circle cx="100" cy="108" r="5" fill="white">
                  <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect x="97" y="112" width="6" height="12" rx="2" fill="white" />
                
                {/* Pulse rings */}
                <circle cx="100" cy="120" r="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
                  <animate attributeName="r" values="60;100" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0" dur="2s" repeatCount="indefinite" />
                </circle>
              </svg>
            </div>
          </div>
        </div>

        {/* Security Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className={`p-6 border border-foreground/10 hover:border-foreground/20 transition-all duration-500 group ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="shrink-0 w-10 h-10 flex items-center justify-center border border-foreground/10 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
