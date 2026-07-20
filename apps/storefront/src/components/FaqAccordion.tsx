import React, { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "What is Râpé?",
    answer: "Râpé is a sacred traditional herbal snuff prepared by the indigenous tribal peoples of the Amazon (Peru and Brazil). Its main component is Mapacho (Nicotiana rustica), which is mixed with different herbs, seeds, bark, and ashes of sacred trees. Each tribe has its own recipe and keeps its composition secret."
  },
  {
    question: "How is Râpé traditionally used?",
    answer: "Râpé is applied using special pipes: a V-shaped pipe called a Kuripe for self-blowing, or a longer pipe called a Tepi when one person blows the powder into another's nostrils. The ritual emphasizes setting a clear intention, expressing gratitude, and maintaining a respectful state of mind."
  },
  {
    question: "Is Râpé legal in the European Union?",
    answer: "Yes. The sacred mixtures offered in our store do not contain any narcotic or prohibited substances. They are fully legal and are offered for incense, collection, and ethnographic research purposes only."
  },
  {
    question: "What are the shipping costs and delivery times?",
    answer: "We deliver across Europe. Standard Shipping takes 5-7 business days and costs €5 (free for orders above €150). DHL Express takes 3-5 business days and costs €12."
  },
  {
    question: "How should I store and clean my Tepi and Kuripe pipes?",
    answer: "Keep your pipes in a dry case or pouch. Do not carry them loose in your pockets with coins or keys. Clean them with a dry cotton swab or small brush. Never use water to wash wooden or bamboo pipes, as moisture can damage them."
  }
];

export const FaqAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto divide-y divide-stone-200">
      {faqs.map((faq, index) => (
        <div key={index} className="py-4">
          <button
            onClick={() => toggleFaq(index)}
            className="flex justify-between items-center w-full text-left font-medium text-stone-900 focus:outline-none py-2"
          >
            <span>{faq.question}</span>
            <span className="ml-6 flex-shrink-0 text-stone-500">
              {openIndex === index ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                </svg>
              )}
            </span>
          </button>
          {openIndex === index && (
            <div className="mt-2 pr-12">
              <p className="text-stone-600 text-sm leading-relaxed">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
