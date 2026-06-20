import { Layout } from "@/components/layout";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="max-w-[860px] mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400 font-semibold mb-3">Legal</p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
          <div className="w-12 h-px bg-gray-900" />
          <p className="text-[12px] text-gray-400 mt-4">Last updated: June 2025</p>
        </div>

        <div className="space-y-10 text-[14px] text-gray-600 leading-relaxed">
          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">When you create an account or place an order on GeekThrifts, we collect the following information:</p>
            <ul className="space-y-2">
              {[
                "Name and contact details (email, phone number)",
                "Delivery address",
                "Order history and product preferences",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use your information to:</p>
            <ul className="space-y-2">
              {[
                "Process and confirm your orders",
                "Arrange and track deliveries",
                "Contact you regarding your order status",
                "Improve our products and services",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="text-gray-400 mt-1">—</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">3. Sharing Your Information</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. Your information is shared only with delivery partners for the sole purpose of fulfilling your order.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p>We take reasonable measures to protect your personal information. Passwords are stored in encrypted form. However, no method of data transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">5. Cookies</h2>
            <p>Our website uses cookies and local storage to maintain your shopping cart and login session. These are stored on your device and are not used for advertising or tracking purposes.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by emailing us at <a href="mailto:geekthriftsstore@gmail.com" className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors">geekthriftsstore@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. Continued use of our website after changes constitutes acceptance of the revised policy.</p>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-gray-900 mb-3">8. Contact</h2>
            <p>For any privacy-related queries, email us at <a href="mailto:geekthriftsstore@gmail.com" className="text-gray-900 underline underline-offset-2 hover:text-gray-500 transition-colors">geekthriftsstore@gmail.com</a>.</p>
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
