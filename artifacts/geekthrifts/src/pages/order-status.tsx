import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function OrderStatus() {
  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">Help</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Order Status</h1>
          <div className="w-12 h-px bg-gray-900" />
        </div>

        <div className="space-y-10 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">How to Check Your Order</h2>
            <p>After placing your order, our team will call or WhatsApp you within <strong className="text-gray-900">24 hours</strong> on the number provided at checkout to confirm your order and delivery details.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Order Statuses</h2>
            <div className="space-y-4">
              {[
                { status: "Pending", desc: "Your order has been received and is awaiting confirmation from our team." },
                { status: "Confirmed", desc: "Our team has confirmed your order. It is being prepared for dispatch." },
                { status: "Delivered", desc: "Your order has been delivered. Cash on delivery payment is collected at this stage." },
                { status: "Cancelled", desc: "Your order was cancelled. Please contact us if this was unexpected." },
              ].map(({ status, desc }) => (
                <div key={status} className="flex gap-4 border-l-2 border-gray-200 pl-4">
                  <div>
                    <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-gray-900 mb-1">{status}</p>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Contact Us</h2>
            <p>For any order-related queries, reach us on Instagram <a href="https://www.instagram.com/geek.thrifts?igsh=MWJwaXVpNGZjajFwdA==" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors">@geek.thrifts</a>. We typically respond within a few hours.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <Link href="/" className="text-[12px] uppercase tracking-[0.1em] font-semibold text-gray-500 hover:text-gray-900 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </Layout>
  );
}
