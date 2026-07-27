import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is Râpé?",
    answer: "Râpé is a natural medicine and sacred traditional herbal blend prepared by the indigenous tribal peoples of the Amazon rainforest (Peru and Brazil). Its main component is Mapacho (Nicotiana rustica), blended with seeds, bark, flowers, and sacred tree ashes. There are about 275 tribes in Brazil alone, each keeping their specific recipe in confidential reverence."
  },
  {
    question: "What is the difference between a Tepi and a Kuripe pipe?",
    answer: "A Kuripe is a V-shaped tube designed for individual self-blowing of mixtures. A Tepi is a longer tube used by a practitioner or shaman to blow the mixture into another person's nostrils. We offer bamboo pipes, tropical hardwood carvings, and handcrafted Sterling Silver pipes which serve as excellent energy conductors."
  },
  {
    question: "How is a Râpé ceremony traditionally conducted?",
    answer: "The ceremony requires a calm environment, straight posture, and clear intention. A small pea-sized dose is loaded into the pipe. The user brings the pipe to their forehead and heart to express gratitude before blowing into each nostril. Active substances absorb within 10-15 minutes."
  },
  {
    question: "How often should Râpé be used?",
    answer: "Traditionally, we recommend using Râpé no more than 1-2 times per week to maintain a harmonious rhythm and deep energetic impact. In special cases — such as releasing habits (smoking/alcohol), clearing sinusitis (morning/evening application with dietary adjustments), or heavy emotional moods — it can be used as needed."
  },
  {
    question: "How do I care for and clean my Tepi and Kuripe?",
    answer: "Keep your pipes in a protective box or pouch to prevent damage from keys or coins. Clean them using a dry cotton swab or small brush. Never wet wooden or bamboo pipes with water, as moisture spoils their appearance and structure."
  },
  {
    question: "What ceremonial aromatics enhance the practice?",
    answer: "Palo Santo wood is burned before ceremony to clear unwanted energies, relieve tension, and purify the space. Agua de Florida is a Peruvian shamanic cologne with notes of neroli, cloves, orange, and rose, sprayed shortly after the blow to deepen relaxation and meditation."
  },
  {
    question: "Is Râpé legal in the European Union?",
    answer: "Yes. All recipes presented in our store do not contain any narcotic or prohibited substances. They are fully legal across the European Union and are supplied as raw botanical specimens for historical, educational, and incense purposes."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4">
      {faqs.map((faq, index) => (
        <div 
          key={index} 
          className="bg-[var(--color-bg-surface-elevated)] border border-[var(--color-border-subtle)] rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
        >
          <button
            onClick={() => toggleFaq(index)}
            className="flex justify-between items-center w-full text-left font-serif-heading font-bold text-[17px] text-[var(--color-text-primary)] focus:outline-none py-5 px-6 transition-colors cursor-pointer group"
          >
            <span>{faq.question}</span>
            <span className={`ml-6 flex-shrink-0 rounded-full p-2 flex items-center justify-center w-8 h-8 transition-colors duration-300 ${openIndex === index ? 'bg-[var(--color-accent-gold)] text-stone-950' : 'bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)] group-hover:border-[var(--color-accent-gold)] group-hover:text-[var(--color-accent-gold)]'}`}>
              <svg 
                className={`h-4 w-4 transition-transform duration-300 ${openIndex === index ? 'rotate-135' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </span>
          </button>
          <div 
            className={`transition-all duration-300 ease-in-out px-6 ${
              openIndex === index ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="text-[var(--color-text-secondary)] text-[15px] leading-relaxed border-t border-[var(--color-border-subtle)] pt-4">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
