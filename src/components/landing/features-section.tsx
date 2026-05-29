"use client";

import { useEffect, useRef, useState } from "react";
import { FileSearch, Brain, ShieldAlert, BookOpen, Scale, Lock } from "lucide-react";

const features = [
  {
    number: "01",
    title: "Clause Extraction",
    description: "Automatically identify and extract key clauses from any contract. Our AI recognizes over 150 clause types across jurisdictions.",
    icon: FileSearch,
    visual: "extract",
  },
  {
    number: "02",
    title: "AI Contract Summaries",
    description: "Get comprehensive contract summaries in seconds. Understand key terms, obligations, and deadlines at a glance.",
    icon: Brain,
    visual: "ai",
  },
  {
    number: "03",
    title: "Risk Detection",
    description: "Identify high-risk clauses before they become problems. Get real-time alerts on liability, indemnification, and termination risks.",
    icon: ShieldAlert,
    visual: "risk",
  },
  {
    number: "04",
    title: "Plain-English Explanations",
    description: "Complex legal jargon translated into clear, understandable language. Perfect for non-legal stakeholders.",
    icon: BookOpen,
    visual: "explain",
  },
  {
    number: "05",
    title: "Negotiation Insights",
    description: "Data-driven recommendations for contract negotiations. Know what&apos;s standard and where you can push back.",
    icon: Scale,
    visual: "negotiate",
  },
  {
    number: "06",
    title: "Secure Document Handling",
    description: "Enterprise-grade encryption and compliance. Your contracts are protected with bank-level security at every step.",
    icon: Lock,
    visual: "security",
  },
];

function ExtractVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <defs>
        <clipPath id="extractClip">
          <rect x="30" y="20" width="140" height="120" rx="4" />
        </clipPath>
      </defs>
      
      <rect x="30" y="20" width="140" height="120" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      
      <g clipPath="url(#extractClip)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="40"
            y={35 + i * 16}
            width="80"
            height="8"
            rx="2"
            fill="currentColor"
            opacity="0.1"
          />
        ))}
        <rect
          x="40"
          y="51"
          width="100"
          height="8"
          rx="2"
          fill="currentColor"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="2s"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x="40"
          y="83"
          width="90"
          height="8"
          rx="2"
          fill="currentColor"
          opacity="0.6"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.8;0.3"
            dur="2s"
            begin="0.5s"
            repeatCount="indefinite"
          />
        </rect>
      </g>
      
      <circle cx="155" cy="80" r="3" fill="currentColor">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function AIVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <circle cx="100" cy="80" r="12" fill="currentColor">
        <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite" />
      </circle>
      
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i * 60) * (Math.PI / 180);
        const radius = 50;
        return (
          <g key={i}>
            <line
              x1="100"
              y1="80"
              x2={100 + Math.cos(angle) * radius}
              y2={80 + Math.sin(angle) * radius}
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.3"
            >
              <animate
                attributeName="opacity"
                values="0.3;0.8;0.3"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </line>
            
            <circle
              cx={100 + Math.cos(angle) * radius}
              cy={80 + Math.sin(angle) * radius}
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <animate
                attributeName="r"
                values="6;8;6"
                dur="2s"
                begin={`${i * 0.3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        );
      })}
      
      <circle cx="100" cy="80" r="30" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="20;60" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function RiskVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <path
        d="M 100 30 L 160 130 L 40 130 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M 100 45 L 145 120 L 55 120 Z"
        fill="currentColor"
        opacity="0.1"
      >
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
      </path>
      
      <line x1="100" y1="70" x2="100" y2="95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="110" r="3" fill="currentColor" />
      
      <circle cx="100" cy="80" r="40" fill="none" stroke="currentColor" strokeWidth="1" opacity="0">
        <animate attributeName="r" values="30;60" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function ExplainVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <rect x="30" y="30" width="60" height="100" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x="40" y={45 + i * 20} width="40" height="6" rx="1" fill="currentColor" opacity="0.3" />
      ))}
      
      <path d="M 100 80 L 120 80" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;-8" dur="0.5s" repeatCount="indefinite" />
      </path>
      
      <rect x="130" y="50" width="50" height="60" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="140" y="65" width="30" height="4" rx="1" fill="currentColor" opacity="0.6">
        <animate attributeName="width" values="10;30;10" dur="2s" repeatCount="indefinite" />
      </rect>
      <rect x="140" y="75" width="25" height="4" rx="1" fill="currentColor" opacity="0.4" />
      <rect x="140" y="85" width="28" height="4" rx="1" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function NegotiateVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <line x1="50" y1="130" x2="50" y2="30" stroke="currentColor" strokeWidth="2" />
      <line x1="50" y1="130" x2="170" y2="130" stroke="currentColor" strokeWidth="2" />
      
      {[
        { x: 70, h: 40 },
        { x: 95, h: 70 },
        { x: 120, h: 55 },
        { x: 145, h: 85 },
      ].map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={130 - bar.h}
          width="18"
          height={bar.h}
          fill="currentColor"
          opacity="0.3"
        >
          <animate
            attributeName="opacity"
            values="0.3;0.7;0.3"
            dur="2s"
            begin={`${i * 0.3}s`}
            repeatCount="indefinite"
          />
        </rect>
      ))}
      
      <path
        d="M 70 100 Q 100 60 130 80 T 155 50"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="4 2"
      >
        <animate attributeName="stroke-dashoffset" values="0;-12" dur="1s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}

function SecurityVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      <path
        d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      <path
        d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z"
        fill="currentColor"
        opacity="0.1"
      >
        <animate attributeName="opacity" values="0.1;0.2;0.1" dur="2s" repeatCount="indefinite" />
      </path>
      
      <rect x="85" y="70" width="30" height="25" rx="3" fill="currentColor" />
      <path
        d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      <circle cx="100" cy="80" r="4" fill="white" />
      <rect x="98" y="82" width="4" height="8" fill="white" />
    </svg>
  );
}

function AnimatedVisual({ type }: { type: string }) {
  switch (type) {
    case "extract":
      return <ExtractVisual />;
    case "ai":
      return <AIVisual />;
    case "risk":
      return <RiskVisual />;
    case "explain":
      return <ExplainVisual />;
    case "negotiate":
      return <NegotiateVisual />;
    case "security":
      return <SecurityVisual />;
    default:
      return <ExtractVisual />;
  }
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const Icon = feature.icon;

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-16 border-b border-foreground/10">
        {/* Number & Icon */}
        <div className="shrink-0 flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
          <span className="font-mono text-sm text-muted-foreground">{feature.number}</span>
          <div className="w-12 h-12 rounded-lg border border-foreground/10 flex items-center justify-center group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl lg:text-3xl font-display mb-4 group-hover:translate-x-2 transition-transform duration-500">
              {feature.title}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {feature.description}
            </p>
          </div>
          
          {/* Visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-40 text-foreground">
              <AnimatedVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

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
      id="features"
      ref={sectionRef}
      className="relative py-24 lg:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Contract intelligence,
            <br />
            <span className="text-muted-foreground">redefined.</span>
          </h2>
        </div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
