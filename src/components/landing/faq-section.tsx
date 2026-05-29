"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does ContractSense protect my sensitive documents?",
    answer: "We use AES-256 encryption for all documents at rest and TLS 1.3 for data in transit. Your contracts are stored in isolated, SOC 2 Type II certified infrastructure. Documents are automatically deleted after processing unless you choose to store them, and we never use your data to train our AI models."
  },
  {
    question: "What types of contracts can ContractSense analyze?",
    answer: "ContractSense can analyze virtually any type of business contract including NDAs, service agreements, employment contracts, licensing agreements, lease agreements, partnership agreements, and more. We support PDF, DOCX, DOC, and 50+ other document formats."
  },
  {
    question: "How accurate is the AI risk detection?",
    answer: "Our AI has been trained on millions of contracts and achieves 92% accuracy in identifying high-risk clauses. The system is continuously improved based on feedback from legal professionals. We recommend using ContractSense as a powerful first-pass tool, with human review for critical decisions."
  },
  {
    question: "Can I integrate ContractSense with my existing tools?",
    answer: "Yes, ContractSense offers API access for Professional and Enterprise plans. We integrate with popular tools like DocuSign, Salesforce, HubSpot, Slack, and major document management systems. Enterprise customers can request custom integrations."
  },
  {
    question: "What compliance certifications does ContractSense have?",
    answer: "ContractSense is SOC 2 Type II certified, ISO 27001 compliant, and supports GDPR, HIPAA, and CCPA requirements. We offer Business Associate Agreements (BAA) for healthcare organizations and can provide detailed compliance documentation upon request."
  },
  {
    question: "Is there a limit to how many contracts I can analyze?",
    answer: "Starter plans include 50 contracts per month. Professional and Enterprise plans offer unlimited contract analysis. All plans include a 14-day free trial so you can test the platform with your actual contracts before committing."
  },
];

function FAQItem({ faq, index, isOpen, onToggle }: { 
  faq: typeof faqs[0]; 
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, []);

  return (
    <div className="border-b border-foreground/10">
      <button
        onClick={onToggle}
        className="w-full py-6 flex items-start justify-between gap-4 text-left group"
      >
        <div className="flex items-start gap-4">
          <span className="font-mono text-sm text-muted-foreground pt-1">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="text-lg lg:text-xl font-medium group-hover:text-foreground/80 transition-colors">
            {faq.question}
          </h3>
        </div>
        <ChevronDown 
          className={`w-5 h-5 shrink-0 mt-1 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div 
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ height: isOpen ? height : 0 }}
      >
        <div ref={contentRef} className="pb-6 pl-12">
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
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
      id="faq"
      ref={sectionRef}
      className="relative py-24 lg:py-32 border-t border-foreground/10"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left: Header */}
          <div className="lg:col-span-4">
            <div 
              className={`lg:sticky lg:top-32 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
                <span className="w-8 h-px bg-foreground/30" />
                FAQ
              </span>
              <h2 className="text-4xl lg:text-5xl font-display tracking-tight mb-6">
                Questions?
                <br />
                <span className="text-muted-foreground">Answers.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Everything you need to know about ContractSense. Can&apos;t find what you&apos;re looking for?
              </p>
              <a 
                href="#" 
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline underline-offset-4"
              >
                Contact our team
                <span className="text-muted-foreground">→</span>
              </a>
            </div>
          </div>

          {/* Right: FAQ List */}
          <div className="lg:col-span-8">
            <div 
              className={`transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index}
                  faq={faq}
                  index={index}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
