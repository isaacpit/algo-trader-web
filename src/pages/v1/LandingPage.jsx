import React from "react";
import Navbar from "../../components/Navbar";
import Hero from "../../components/v2/Hero";
import FeaturesIcons from "../../components/FeaturesIcons";
import ChartDemo from "../../components/ChartDemo";
import PricingTable from "../../components/PricingTable";
import PricingPlans from "../../components/PricingPlans";
import Footer from "../../components/Footer";

export default function LandingPage() {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 text-white min-h-screen">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      <div className="relative z-10">
        <Navbar />
        <div className="pt-20">
          <Hero />
          <FeaturesIcons />
          <ChartDemo />
          <section
            id="pricing"
            className="py-24 px-6 text-center max-w-6xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-12">Choose Your Plan</h2>
            <PricingTable />
            <PricingPlans />
          </section>
        </div>
        <Footer />
      </div>
    </div>
  );
} 