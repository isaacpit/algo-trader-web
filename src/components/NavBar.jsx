import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav
            className={`
        fixed w-full z-50 transition-all duration-300
        ${
                scrolled
                    ? "bg-gray-900/80 backdrop-blur-md shadow-md"
                    : "bg-transparent"
            }
      `}
        >
            <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center md:py-4">
                <div
                    className={`
            text-2xl font-extrabold cursor-pointer
            transition-colors duration-300
            ${scrolled ? "text-white" : "text-white"}
          `}
                >
                    Algo Trader
                </div>

                {/* Desktop Links */}
                <div
                    className={`
            hidden md:flex space-x-10 font-medium text-sm
            ${scrolled ? "text-gray-200" : "text-white"}
          `}
                >
                    {["Features", "Pricing", "Backtesting"].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase()}`}
                            className="relative group py-1 hover:text-indigo-300 transition-colors duration-300"
                        >
                            {item}
                            <span className="absolute left-0 -bottom-1 w-0 group-hover:w-full h-0.5 bg-indigo-400 transition-all duration-300"></span>
                        </a>
                    ))}
                    <button
                        className={`
              px-5 py-2 rounded-full font-semibold text-sm
              transition-colors duration-300
              ${scrolled ? "bg-indigo-500 text-white hover:bg-indigo-600" : "bg-white/10 text-white hover:bg-white/20"}
            `}
                    >
                        Get Started
                    </button>
                </div>

                {/* Mobile menu button */}
                <button
                    className={`md:hidden text-2xl focus:outline-none text-white`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <FaTimes /> : <FaBars />}
                </button>
            </div>

            {/* Mobile menu */}
            <div
                className={`
    absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-md shadow-lg px-4 py-3 space-y-3 font-medium text-center transition-transform duration-300 origin-top z-40
    ${isOpen ? "scale-y-100" : "scale-y-0 pointer-events-none"}
  `}
                style={{transformOrigin: "top"}}
            >
                {["Features", "Pricing", "Backtesting"].map((item) => (
                    <a
                        key={item}
                        href={`#${item.toLowerCase()}`}
                        className="block py-2 text-white hover:text-indigo-300"
                        onClick={() => setIsOpen(false)}
                    >
                        {item}
                    </a>
                ))}
                <button
                    className="w-full bg-indigo-500 text-white rounded-full px-4 py-2 font-semibold hover:bg-indigo-600 transition"
                    onClick={() => setIsOpen(false)}
                >
                    Get Started
                </button>
            </div>
        </nav>
    );
}


// import React, {useState, useEffect} from "react";
// import {FaBars, FaTimes} from "react-icons/fa";
//
// export default function Navbar() {
//     const [isOpen, setIsOpen] = useState(false);
//     const [scrolled, setScrolled] = useState(false);
//
//     // Add shadow and background change on scroll
//     useEffect(() => {
//         const handleScroll = () => {
//             setScrolled(window.scrollY > 20);
//         };
//         window.addEventListener("scroll", handleScroll);
//         return () => window.removeEventListener("scroll", handleScroll);
//     }, []);
//
//     const toggleMenu = () => setIsOpen(!isOpen);
//
//     return (
//         <nav
//             className={`
//         fixed w-full z-50 transition-all duration-300
//         ${
//                 scrolled
//                     ? "bg-white/80 backdrop-blur-md shadow-md"
//                     : "bg-white/20 backdrop-blur-sm"
//             }
//   `}
//         >
//             <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
//                 <div
//                     className={`
//             text-2xl font-extrabold cursor-pointer
//             transition-colors duration-300
//             ${scrolled ? "text-indigo-700" : "text-white"}
//           `}
//                 >
//                     Algo Trader
//                 </div>
//
//                 {/* Desktop Links */}
//                 <div
//                     className={`
//                     hidden md:flex space-x-10 font-medium text-sm
//                         ${scrolled ? "text-gray-700" : "text-indigo-900"}
//                     `}
//                 >
//                     {["Features", "Pricing", "Backtesting"].map((item) => (
//                         <a
//                             key={item}
//                             href={`#${item.toLowerCase()}`}
//                             className="relative group py-1 hover:text-indigo-600 transition-colors duration-300"
//                         >
//                             {item}
//                             <span
//                                 className="absolute left-0 -bottom-1 w-0 group-hover:w-full h-0.5 bg-indigo-600 transition-all duration-300"></span>
//                         </a>
//                     ))}
//                     <button
//                         className={`
//               px-5 py-2 rounded-full font-semibold text-sm
//               transition-colors duration-300
//               ${scrolled ? "bg-indigo-600 text-white hover:bg-indigo-700" : "bg-white text-indigo-700 hover:bg-indigo-100"}
//             `}
//                     >
//                         Get Started
//                     </button>
//                 </div>
//
//                 {/* Mobile menu button */}
//                 <button
//                     className={`md:hidden text-2xl focus:outline-none ${
//                         scrolled ? "text-gray-700" : "text-indigo-900"
//                     }`}
//                     onClick={toggleMenu}
//                     aria-label="Toggle menu"
//                 >
//                     {isOpen ? <FaTimes/> : <FaBars/>}
//                 </button>
//             </div>
//
//             {/* Mobile menu */}
//             <div
//                 className={`
//           md:hidden bg-white/95 backdrop-blur-md shadow-lg px-6 py-6 space-y-6 font-medium text-center transition-transform duration-300 origin-top
//           ${isOpen ? "scale-y-100" : "scale-y-0 pointer-events-none"}
//         `}
//                 style={{transformOrigin: "top"}}
//             >
//                 {["Features", "Pricing", "Backtesting"].map((item) => (
//                     <a
//                         key={item}
//                         href={`#${item.toLowerCase()}`}
//                         className="block py-2 text-indigo-700 hover:underline"
//                         onClick={() => setIsOpen(false)}
//                     >
//                         {item}
//                     </a>
//                 ))}
//                 <button
//                     className="w-full bg-indigo-600 text-white rounded-full px-4 py-2 font-semibold hover:bg-indigo-700 transition"
//                     onClick={() => setIsOpen(false)}
//                 >
//                     Get Started
//                 </button>
//             </div>
//         </nav>
//     );
// }
