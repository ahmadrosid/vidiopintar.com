"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqData, faqCategories } from "@/data/faq";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredFaqs =
    selectedCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Generate JSON-LD schema for FAQPage
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: filteredFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="flex flex-col gap-7 pt-28">
      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <div className="flex justify-start items-center gap-2 w-full">
        <div className="w-4 h-1 bg-accent rounded-full"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          FAQ
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-4xl text-primary font-semibold tracking-tight">
          Frequently Asked Questions
        </h2>
        <p className="text-secondary-foreground text-base">
          Everything you need to know about learning faster from YouTube with
          AI-powered video summaries and chat
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-xs text-[0.9375rem] font-medium transition-colors ${
            selectedCategory === "All"
              ? "bg-primary text-primary-foreground"
              : "bg-card hover:bg-card/85 text-primary"
          }`}
        >
          All Questions
        </button>
        {faqCategories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 cursor-pointer py-2 rounded-xs text-[0.9375rem] font-medium transition-colors ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:bg-card/85 text-primary"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="flex flex-col gap-2.5">
        {filteredFaqs.map((faq, index) => (
          <div
            key={index}
            className="bg-card rounded-xs overflow-hidden hover:bg-card/85 transition"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="cursor-pointer w-full px-7 py-6 text-left flex items-center justify-between"
              aria-expanded={openIndex === index}
            >
              <span className="font-semibold text-lg text-primary pr-8">
                {faq.question}
              </span>
              <ChevronDown
                className={`w-5 h-5 flex-shrink-0 text-primary transition-transform duration-300 ease-in-out ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-7 pb-6 pt-2">
                <p className="text-secondary-foreground text-[0.9375rem] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
