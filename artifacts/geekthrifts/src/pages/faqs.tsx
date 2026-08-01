import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useState } from "react";

const FAQS = [
  {
    q: "Are all items genuine thrift / pre-owned?",
    a: "Yes. Every item on GeekThrifts is hand-picked from thrift markets and pre-owned sources. We inspect each piece for quality before listing it.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Cash on Delivery (COD) only. Payment is collected by the courier when your order is delivered. No online payment is required.",
  },
  {
    q: "How do I place an order?",
    a: "Browse our collection, add items to your cart, and proceed to checkout. Fill in your delivery details and submit. Our team will confirm your order within 24 hours via call or WhatsApp.",
  },
  {
    q: "Can I return an item if I change my mind?",
    a: "We accept returns within 3 days of delivery only if the item is significantly different from its description or has an undisclosed defect. Please review our Return Policy for full details.",
  },
  {
    q: "How do I know my size?",
    a: "Each product listing includes available sizes. Since items are pre-owned, we recommend checking the size label in the listing photos or contacting us on Instagram for measurements.",
  },
  {
    q: "Do you deliver across all of Pakistan?",
    a: "Yes, we deliver nationwide. Karachi, Lahore, and Islamabad typically receive orders within 1–3 business days. Other cities may take 3–5 business days.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "In the unlikely event that an item arrives damaged or is not as described, contact us on geekthriftsstore@gmail.com within 3 days with photos. We will arrange a return and refund or exchange.",
  },
  {
    q: "How do I track my order?",
    a: "After your order is dispatched, our team will share tracking details via WhatsApp or call. You can also visit our Order Status page for guidance.",
  },
  {
    q: "Can I cancel my order?",
    a: "You can request a cancellation before your order is dispatched by messaging us on Instagram. Once dispatched, cancellations are not possible.",
  },
  {
    q: "How do I contact GeekThrifts?",
    a: "Reach us on geekthriftsstore@gmail.com. We are active and typically respond within a few hours.",
  },
];

export default function FAQs() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">Help</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Frequently Asked Questions</h1>
          <div className="w-12 h-px bg-gray-900" />
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-center justify-between py-5 text-left gap-4"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-[14px] font-semibold text-gray-900">{faq.q}</span>
                <span className="text-gray-400 text-[18px] leading-none shrink-0">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <p className="pb-5 text-[14px] text-gray-600 leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-[14px] text-gray-500 mb-4">Still have questions?</p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:geekthriftsstore@gmail.com"
              className="inline-block h-11 px-7 bg-gray-900 text-white text-[12px] uppercase tracking-[0.12em] font-semibold hover:bg-gray-800 transition-colors leading-[44px]"
            >
              Email Us
            </a>
            <a
              href="https://www.instagram.com/geek.thrifts?igsh=MWJwaXVpNGZjajFwdA=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block h-11 px-7 border border-gray-900 text-gray-900 text-[12px] uppercase tracking-[0.12em] font-semibold hover:bg-gray-50 transition-colors leading-[44px]"
            >
              Instagram
            </a>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/" className="text-[12px] uppercase tracking-[0.1em] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
