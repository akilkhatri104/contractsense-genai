"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Cpu, FileText } from "lucide-react";

const steps = [
  {
    number: "I",
    title: "Upload Contract",
    description: "Simply drag and drop your contract in any format. We support PDF, DOCX, and 50+ other file types.",
    icon: Upload,
    code: `// Upload your contract
const analysis = await contractSense.upload({
  file: 'service-agreement.pdf',
  language: 'auto-detect'
})

console.log('Contract uploaded:', analysis.id)`,
  },
  {
    number: "II",
    title: "AI Analyzes Clauses",
    description: "Our advanced AI engine processes the document, extracting clauses and identifying potential risks.",
    icon: Cpu,
    code: `// AI processes the contract
const results = await analysis.process({
  extractClauses: true,
  detectRisks: true,
  compareToStandard: true
})

// 147 clauses identified
// 3 high-risk items flagged`,
  },
  {
    number: "III",
    title: "Receive Insights",
    description: "Get a comprehensive report with risk scores, plain-English summaries, and actionable recommendations.",
    icon: FileText,
    code: `// Get comprehensive insights
const report = await analysis.getReport()

{
  riskScore: 72,
  clauses: 147,
  recommendations: [
    'Add liability cap to Section 8',
    'Review indemnification scope',
    'Clarify termination notice period'
  ]
}`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden"
    >
      {/* Diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 40px,
            currentColor 40px,
            currentColor 41px
          )`
        }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-background/50 mb-6">
            <span className="w-8 h-px bg-background/30" />
            How It Works
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Three simple steps.
            <br />
            <span className="text-background/50">Complete clarity.</span>
          </h2>
        </div>

        {/* Main content */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Steps */}
          <div className="space-y-0">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left py-8 border-b border-background/10 transition-all duration-500 group ${
                    activeStep === index ? "opacity-100" : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <span className="font-display text-2xl text-background/30">{step.number}</span>
                      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors duration-300 ${
                        activeStep === index 
                          ? "bg-background text-foreground border-background" 
                          : "border-background/20"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-display mb-3 group-hover:translate-x-2 transition-transform duration-300">
                        {step.title}
                      </h3>
                      <p className="text-background/60 leading-relaxed">
                        {step.description}
                      </p>
                      
                      {/* Progress indicator */}
                      {activeStep === index && (
                        <div className="mt-4 h-px bg-background/20 overflow-hidden">
                          <div 
                            className="h-full bg-background w-0"
                            style={{
                              animation: 'progress 5s linear forwards'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Code display */}
          <div className="lg:sticky lg:top-32 self-start">
            <div className="border border-background/10 overflow-hidden">
              {/* Window header */}
              <div className="px-6 py-4 border-b border-background/10 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                  <div className="w-3 h-3 rounded-full bg-background/20" />
                </div>
                <span className="text-xs font-mono text-background/40">analyze.ts</span>
              </div>

              {/* Code content */}
              <div className="p-8 font-mono text-sm min-h-[320px]">
                <pre className="text-background/70">
                  {steps[activeStep].code.split('\n').map((line, lineIndex) => (
                    <div 
                      key={`${activeStep}-${lineIndex}`} 
                      className="leading-loose code-line-reveal"
                      style={{ 
                        animationDelay: `${lineIndex * 80}ms`,
                      }}
                    >
                      <span className="text-background/20 select-none w-8 inline-block">{lineIndex + 1}</span>
                      <span className="inline-flex">
                        {line.split('').map((char, charIndex) => (
                          <span
                            key={`${activeStep}-${lineIndex}-${charIndex}`}
                            className="code-char-reveal"
                            style={{
                              animationDelay: `${lineIndex * 80 + charIndex * 15}ms`,
                            }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>

              {/* Status */}
              <div className="px-6 py-4 border-t border-background/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-mono text-background/40">Analysis Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        
        .code-line-reveal {
          opacity: 0;
          transform: translateX(-8px);
          animation: lineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes lineReveal {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .code-char-reveal {
          opacity: 0;
          filter: blur(8px);
          animation: charReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        
        @keyframes charReveal {
          to {
            opacity: 1;
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}
