import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Navbar } from "../Navbar";
import { DebugPanel } from "../DebugPanel";
import { FeaturesIcons } from "../../components/FeaturesIcons";

export const PageLayout = ({ children }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <Navbar />
      <main className="container mx-auto px-4 py-8">{children}</main>
      <DebugPanel />
    </div>
  );
};
