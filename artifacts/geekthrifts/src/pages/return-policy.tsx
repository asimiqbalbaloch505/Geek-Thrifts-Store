import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function ReturnPolicy() {
  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">Help</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Return Policy</h1>
          <div className="w-12 h-px bg-gray-900" />
        </div>

        <div className="space-y-10 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Our Policy</h2>
            <p>At GeekThrifts, we carefully inspect every item before it is listed and dispatched. Since all our products are pre-owned thrift pieces, we have a <strong className="text-gray-900">limited return window</strong> to ensure fairness.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Eligible Returns</h2>
            <p className="mb-3">Returns are accepted within <strong className="text-gray-900">3 days of delivery</strong> only if:</p>
            <ul className="space-y-2 list-none">
              {[
                "The item received is significantly different from its description or photos.",
                "The item has a defect that was not disclosed in the listing.",
                "The wrong item was delivered.",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Non-Returnable Items</h2>
            <ul className="space-y-2 list-none">
              {[
                "Items returned after 3 days of delivery.",
                "Items that have been worn, washed, or altered after delivery.",
                "Items returned without original tags or packaging.",
                "Items where the condition matches the listing description accurately.",
              ].map((point) => (
                <li key={point} className="flex gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">How to Return</h2>
            <p>To initiate a return, email us at <a href="mailto:geekthriftsstore@gmail.com" className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors">geekthriftsstore@gmail.com</a> or message us on Instagram <a href="https://www.instagram.com/geek.thrifts?igsh=MWJwaXVpNGZjajFwdA==" target="_blank" rel="noopener noreferrer" className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors">@geek.thrifts</a> within 3 days of receiving your order. Include your order details and photos of the issue.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Refunds</h2>
            <p>Approved returns are eligible for a <strong className="text-gray-900">full refund or exchange</strong>. Refunds are processed via bank transfer within 5–7 business days after the returned item is received and inspected.</p>
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
