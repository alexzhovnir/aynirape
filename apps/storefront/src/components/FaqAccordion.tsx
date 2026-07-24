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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto divide-y divide-[var(--color-border-subtle)]">
      {faqs.map((faq, index) => (
        <div key={index} className="py-5">
          <button
            onClick={() => toggleFaq(index)}
            className="flex justify-between items-center w-full text-left font-serif-heading font-bold text-lg text-[var(--color-text-primary)] hover:text-[var(--color-accent-gold)] focus:outline-none py-1 transition-colors cursor-pointer"
          >
            <span>{faq.question}</span>
            <span className="ml-6 flex-shrink-0 text-[var(--color-accent-gold)]">
              {openIndex === index ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                </svg>
              )}
            </span>
          </button>
          {openIndex === index && (
            <div className="mt-3 pr-8">
              <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
