import Image from 'next/image'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-faqs.jpg'

const faqs = [
  [
    {
      question: 'Can I really switch between Creative, Legal, and Research writing?',
      answer:
        'Yes! Just pick your mode and the AI adapts instantly to give you the right tone and style.',
    },
    {
      question: 'Does the app correct my grammar and spelling too?',
      answer: 'Absolutely — you get realtime suggestions and corrections as you write.',
    },
    {
      question: 'Can I use this for both short notes and long documents?',
      answer:
        'Of course! Whether it’s a quick paragraph or a full report, the AI scales with your writing.',
    },
  ],
  [
    {
      question: 'Is this safe for legal or academic work?',
      answer:
        'We aim for accuracy and structure, but you should always verify critical legal or research content.',
    },
    {
      question: 'Can I collaborate with teammates on the same document?',
      answer:
        'Not yet — but collaboration features are on our roadmap for future updates.',
    },
    {
      question: 'Do I need prior writing skills to use this?',
      answer:
        'Not at all. Our AI helps beginners sound professional and lets experts polish their drafts faster.',
    },
  ],
  [
    {
      question: 'What makes your AI different from normal grammar checkers?',
      answer:
        'Unlike basic grammar tools, our AI rewrites with context — whether creative flair, legal precision, or technical clarity.',
    },
    {
      question: 'Does it work in realtime or only after finishing a draft?',
      answer: 'Both — you can get live suggestions while typing or run a full check at the end.',
    },
    {
      question: 'Is there a free version I can try before subscribing?',
      answer:
        'Yes, we offer a free trial so you can explore all modes before committing.',
    },
  ],
]


export function Faqs() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="relative overflow-hidden bg-zinc-50 py-20 sm:py-32"
    >
      <Image
        className="absolute left-1/2 top-0 max-w-none -tranzinc-y-1/4 tranzinc-x-[-30%]"
        src={backgroundImage}
        alt=""
        width={1558}
        height={946}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2
            id="faq-title"
            className="font-display text-3xl tracking-tight text-zinc-900 sm:text-4xl"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg tracking-tight text-zinc-700">
            If you can’t find what you’re looking for, email our support team
            and if you’re lucky someone will get back to you.
          </p>
        </div>
        <ul
          role="list"
          className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3"
        >
          {faqs.map((column, columnIndex) => (
            <li key={columnIndex}>
              <ul role="list" className="flex flex-col gap-y-8">
                {column.map((faq, faqIndex) => (
                  <li key={faqIndex}>
                    <h3 className="font-display text-lg leading-7 text-zinc-900">
                      {faq.question}
                    </h3>
                    <p className="mt-4 text-sm text-zinc-700">{faq.answer}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
