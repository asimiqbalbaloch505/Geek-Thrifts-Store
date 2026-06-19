import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function Shipping() {
  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">Help</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Shipping &amp; Delivery</h1>
          <div className="w-12 h-px bg-gray-900" />
        </div>

        <div className="space-y-10 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Delivery Areas</h2>
            <p>We currently deliver across <strong className="text-gray-900">Pakistan</strong>, with priority coverage in Karachi, Lahore, and Islamabad. Deliveries to other cities may take additional time.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Delivery Timeframe</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 pr-8 font-bold uppercase tracking-[0.08em] text-gray-900">City</th>
                    <th className="text-left py-2 font-bold uppercase tracking-[0.08em] text-gray-900">Estimated Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    ["Karachi", "1–2 business days"],
                    ["Lahore", "2–3 business days"],
                    ["Islamabad / Rawalpindi", "2–3 business days"],
                    ["Other cities", "3–5 business days"],
                  ].map(([city, time]) => (
                    <tr key={city}>
                      <td className="py-2.5 pr-8 text-gray-700">{city}</td>
                      <td className="py-2.5 text-gray-700">{time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Payment</h2>
            <p>All orders are <strong className="text-gray-900">Cash on Delivery (COD)</strong> only. Payment is collected by the courier at the time of delivery. No online payment is required or accepted.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Shipping Charges</h2>
            <p>Shipping charges are calculated at checkout based on your delivery location. We strive to keep shipping costs affordable for all customers.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">Order Confirmation</h2>
            <p>Our team will contact you via call or WhatsApp within 24 hours of placing your order to confirm delivery details before dispatch.</p>
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
