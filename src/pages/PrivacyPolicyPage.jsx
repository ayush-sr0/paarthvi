import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, CheckCircle, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop py-12 space-y-8 font-body">
      
      {/* Back to Home */}
      <Link to="/" className="inline-flex items-center gap-2 text-xs font-label uppercase font-bold text-primary hover:text-gold-leaf transition-colors">
        <ArrowLeft size={16} /> Back to Storefront
      </Link>

      {/* Page Header */}
      <div className="bg-primary text-on-primary p-8 rounded-2xl space-y-3 shadow-md border border-gold-leaf/30">
        <div className="flex items-center gap-2 text-gold-leaf text-xs font-label uppercase tracking-widest font-bold">
          <ShieldCheck size={18} /> Google OAuth & Regulatory Compliant
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold">Privacy Policy & Data Disclosures</h1>
        <p className="text-xs opacity-90 leading-relaxed font-body">
          Effective Date: August 27, 2026 | Entity: Paarthvi Herbal Formulations Pvt. Ltd. ("Parthvi Ayurveda")
        </p>
      </div>

      {/* Policy Content */}
      <div className="bg-surface p-8 md:p-10 rounded-2xl border border-outline/20 space-y-8 text-sm leading-relaxed text-on-surface">
        
        {/* Introduction */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-primary border-b border-outline/10 pb-2">1. Introduction</h2>
          <p>
            Welcome to <strong>Parthvi Ayurveda</strong> (operated by <strong>Paarthvi Herbal Formulations Pvt. Ltd.</strong>, having its registered office at Gaur City Center, Greater Noida, Uttar Pradesh - 201318, India).
          </p>

          <p>
            We are committed to respecting your privacy and protecting the personal information you share with us. This Privacy Policy details how we collect, use, store, process, and protect your data when you visit our website (<strong>parthvi.com</strong>), use our mobile applications, interact with our services, or sign in using <strong>Google Sign-In (OAuth)</strong> or Supabase Authentication.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-primary border-b border-outline/10 pb-2">2. Information We Collect</h2>
          <p>We collect information necessary to process your e-commerce orders, verify your identity, and provide personalized Ayurvedic wellness advice:</p>
          
          <div className="bg-surface-container p-4 rounded-xl space-y-2 border border-outline/10 text-xs">
            <h3 className="font-bold text-primary font-label uppercase">A. Information Provided Directly By You:</h3>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Contact Information:</strong> Full name, email address, mobile phone number, and delivery street address.</li>
              <li><strong>Order & Transaction Records:</strong> Purchased products, payment status, shipping preferences, and billing records.</li>
              <li><strong>Customer Support Interactions:</strong> Messages, support tickets, return requests, and product reviews.</li>
            </ul>
          </div>

          <div className="bg-primary/5 p-4 rounded-xl space-y-2 border border-gold-leaf/30 text-xs">
            <h3 className="font-bold text-primary font-label uppercase flex items-center gap-1.5">
              <Lock size={14} className="text-gold-leaf" /> B. Information Collected via Google OAuth (Google Sign-In):
            </h3>
            <p className="text-on-surface-variant">
              When you choose to register or log in using <strong>Continue with Google</strong>, we access the following basic profile information provided by Google OAuth APIs:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li><strong>Google Primary Email Address:</strong> Used as your unique account identifier and for order status updates.</li>
              <li><strong>Google Full Name:</strong> Used to personalize your customer profile and delivery address book.</li>
              <li><strong>Google Profile Avatar Picture URL:</strong> Used optionally to display your avatar in your customer account menu.</li>
            </ul>
          </div>

          <div className="bg-surface-container p-4 rounded-xl space-y-2 border border-outline/10 text-xs">
            <h3 className="font-bold text-primary font-label uppercase">C. Technical & Usage Data:</h3>
            <ul className="list-disc pl-5 space-y-1 text-on-surface-variant">
              <li>IP address, browser type, device information, operating system, and pages viewed during your session.</li>
            </ul>
          </div>
        </section>

        {/* How We Use Google User Data */}
        <section className="space-y-4 bg-sacred-palace/30 p-6 rounded-2xl border border-gold-leaf/40">
          <h2 className="font-display text-xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="text-gold-leaf shrink-0" /> 3. Use & Disclosure of Google User Data (Google Limited Use Policy)
          </h2>
          
          <p className="text-xs font-semibold text-primary">
            Parthvi Ayurveda adheres strictly to the <strong>Google API Services User Data Policy</strong>, including the <em>Limited Use</em> requirements.
          </p>

          <div className="space-y-3 text-xs text-on-surface-variant">
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-gold-leaf shrink-0 mt-0.5" />
              <span><strong>Account Authentication:</strong> We use your Google profile data strictly to authenticate your identity and log you into your Parthvi Ayurveda customer account.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-gold-leaf shrink-0 mt-0.5" />
              <span><strong>NO Data Selling or Transfer:</strong> We <strong>DO NOT</strong> sell, rent, trade, or transfer your Google User Data to any third-party data brokers, advertising networks, or external marketers.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-gold-leaf shrink-0 mt-0.5" />
              <span><strong>NO Advertising Use:</strong> Google user data is NEVER used for serving advertisements, target profiling, or selling to third-party ad exchanges.</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle size={16} className="text-gold-leaf shrink-0 mt-0.5" />
              <span><strong>Human Inspection Restrictions:</strong> No human employees or contractors at Parthvi Ayurveda read your Google User Data unless required for safety investigations, legal compliance, or upon your explicit support request.</span>
            </div>
          </div>
        </section>

        {/* Data Sharing & Service Providers */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-primary border-b border-outline/10 pb-2">4. Data Sharing & Third-Party Service Providers</h2>
          <p>
            We only share necessary operational data with trusted third-party service providers who assist us in operating our e-commerce platform under strict non-disclosure obligations:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs text-on-surface-variant">
            <li><strong>Payment Gateways (Cashfree Payments):</strong> Transactions are processed securely via PCI-DSS Level 1 Compliant payment engines. We do not store credit/debit card numbers or CVVs on our servers.</li>

            <li><strong>Logistics & Delivery Partners (Delhivery, BlueDart):</strong> Your shipping address and mobile phone number are shared exclusively to fulfill parcel delivery and send delivery SMS alerts.</li>
            <li><strong>Cloud Infrastructure (Supabase & PostgreSQL):</strong> Customer databases are encrypted at rest and in transit using SSL/TLS 256-bit encryption.</li>
          </ul>
        </section>

        {/* Data Retention & Account Deletion */}
        <section className="space-y-3 bg-surface-container p-6 rounded-2xl border border-outline/20">
          <h2 className="font-display text-xl font-bold text-primary">5. Data Retention & Account Deletion Requests</h2>
          <p className="text-xs text-on-surface-variant">
            We retain customer information for as long as your account remains active or as required by Indian tax and accounting laws (GST, Companies Act).
          </p>
          <div className="pt-2">
            <h3 className="font-bold text-xs text-primary font-label uppercase mb-1">How to Request Immediate Account & Data Deletion:</h3>
            <p className="text-xs text-on-surface-variant">
              You have the right to request deletion of your account and all associated personal and Google OAuth data at any time. To request data removal:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-xs text-on-surface-variant font-mono">
              <li>Email our Privacy Officer at <strong>care@parthvi.com</strong> or <strong>grievance@parthvi.com</strong> with the subject line <em>"Account Deletion Request"</em>.</li>
              <li>Or raise a ticket in your Customer Account Dashboard under Support Desk.</li>
            </ul>
            <p className="text-[11px] text-on-surface-variant mt-2 italic">
              Upon request receipt, your profile, addresses, and Google OAuth bindings will be permanently deleted from our servers within 48 hours.
            </p>
          </div>
        </section>

        {/* Security Standards */}
        <section className="space-y-3">
          <h2 className="font-display text-xl font-bold text-primary border-b border-outline/10 pb-2">6. Security Measures</h2>
          <p className="text-xs text-on-surface-variant">
            We employ industry-standard administrative, physical, and electronic security safeguards, including HTTPS SSL encryption, firewalls, and role-based database permissions, to safeguard your data against unauthorized access, loss, or alteration.
          </p>
        </section>

        {/* Statutory Compliance & Grievance Redressal */}
        <section className="space-y-3 border-t border-outline/10 pt-6">
          <h2 className="font-display text-xl font-bold text-primary">7. Statutory Compliance & Grievance Redressal</h2>
          <p className="text-xs text-on-surface-variant">
            This policy is published in accordance with Rule 3(1) of the Information Technology (Intermediaries Guidelines and Digital Media Ethics Code) Rules, 2021 and the Digital Personal Data Protection Act, 2023 (DPDP Act).
          </p>

          <div className="bg-surface-container-high p-4 rounded-xl space-y-2 border border-gold-leaf/20 text-xs">
            <h3 className="font-bold text-primary font-label uppercase">Grievance Officer Contact Details:</h3>
            <p><strong>Name:</strong> Grievance Officer, Paarthvi Herbal Formulations Pvt. Ltd.</p>
            <p><strong>Address:</strong> Gaur City Center, Greater Noida, Uttar Pradesh - 201318, India</p>
            <p><strong>Email:</strong> care@parthvi.com / grievance@parthvi.com</p>
            <p><strong>Phone:</strong> +91 98765 43210 (Mon–Sat, 9:00 AM – 6:00 PM IST)</p>
          </div>

        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
