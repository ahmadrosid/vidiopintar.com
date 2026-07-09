"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqData, faqCategories } from "@/data/faq";

type FAQProps = {
  headingLevel?: "h1" | "h2";
};

export function FAQ({ headingLevel = "h2" }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const filteredFaqs =
    selectedCategory === "All"
      ? faqData
      : faqData.filter((faq) => faq.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const HeadingTag = headingLevel;

  return (
    <section className="flex flex-col gap-7 pt-28">
      <div className="flex justify-start items-center gap-2 w-full">
        <div className="w-4 h-1 bg-accent rounded-full"></div>
        <div className="uppercase text-[0.8125rem] text-secondary-foreground font-medium">
          FAQ
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <HeadingTag className="text-4xl text-primary font-semibold tracking-tight">
          Frequently Asked Questions
        </HeadingTag>
        <p className="text-secondary-foreground text-base">
          Everything you need to know about learning faster from YouTube with
          AI-powered video summaries and chat. Vidiopintar helps you paste a
          YouTube URL, extract key insights, ask follow-up questions, and keep
          useful videos in a personal library. Browse the questions below or
          filter by category to find pricing, privacy, and feature details.
        </p>
      </div>

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

      {/* Always serialize every FAQ answer in the HTML for agents; filter only affects visual emphasis */}
      <div className="flex flex-col gap-2.5">
        {faqData.map((faq, index) => {
          const isVisible =
            selectedCategory === "All" || faq.category === selectedCategory;
          const filteredIndex = filteredFaqs.indexOf(faq);
          const isOpen = isVisible && openIndex === filteredIndex;

          return (
            <div
              key={faq.question}
              className={`bg-card rounded-xs overflow-hidden hover:bg-card/85 transition ${
                isVisible ? "" : "sr-only"
              }`}
              data-category={faq.category}
            >
              <button
                onClick={() => {
                  if (!isVisible) return;
                  toggleFAQ(filteredIndex);
                }}
                className="cursor-pointer w-full px-7 py-6 text-left flex items-center justify-between"
                aria-expanded={isOpen}
                tabIndex={isVisible ? 0 : -1}
              >
                <span className="font-semibold text-lg text-primary pr-8">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 text-primary transition-transform duration-300 ease-in-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={
                  isVisible
                    ? `overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen
                          ? "max-h-[500px] opacity-100"
                          : "max-h-0 opacity-0"
                    }`
                    : ""
                }
              >
                <div className="px-7 pb-6 pt-2">
                  <p className="text-secondary-foreground text-[0.9375rem] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
