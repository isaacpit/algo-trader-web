import React from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import FeaturesIcons from "./components/FeaturesIcons";
import ChartDemo from "./components/ChartDemo";
import PricingTable from "./components/PricingTable";
import PricingPlans from "./components/PricingPlans";
import Footer from "./components/Footer";

function App() {
  return (
      <div className="bg-white text-gray-800 min-h-screen scroll-smooth">
          <Navbar/>
          {/* Add top padding to avoid content behind navbar */}
          <div className="pt-20">
              <Hero/>
              <FeaturesIcons/>
              <ChartDemo/>
              <section
                  id="pricing"
                  className="py-24 px-6 bg-white text-center max-w-6xl mx-auto"
              >
                  <h2 className="text-3xl font-bold mb-12">Choose Your Plan</h2>
                  <PricingTable/>
                  <PricingPlans/>
              </section>
          </div>
          <Footer/>
      </div>
      // <div className="bg-white text-gray-800 min-h-screen scroll-smooth">
      //   <Hero />
      //   <FeaturesIcons />
      //   <ChartDemo />
      //   <section className="py-24 px-6 bg-white text-center max-w-6xl mx-auto">
      //     <h2 className="text-3xl font-bold mb-12">Choose Your Plan</h2>
      //     <PricingTable />
      //     <PricingPlans />
      //   </section>
      //   <Footer />
      // </div>
  );
}

export default App;
