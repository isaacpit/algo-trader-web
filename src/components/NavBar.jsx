import React, { useState, useEffect } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDebug } from '../context/DebugContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();
    const { isDarkMode, toggleTheme } = useTheme();
    const { isDebugMode, toggleDebugMode } = useDebug();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogoClick = (e) => {
        e.preventDefault();
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link 
                        to="/" 
                        onClick={handleLogoClick}
                        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <span className="text-white font-semibold text-lg">Algo Trader</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={toggleDebugMode}
                            className={`p-2 rounded-md ${
                                isDebugMode
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                            title="Toggle Debug Mode"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            title="Toggle Theme"
                        >
                            {isDarkMode ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>
                        <a
                            href="#features"
                            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                        >
                            Features
                        </a>
                        <a
                            href="#pricing"
                            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                        >
                            Pricing
                        </a>
                        <a
                            href="#contact"
                            className="text-gray-300 hover:text-white px-3 py-2 text-sm font-medium"
                        >
                            Contact
                        </a>
                        <Link
                            to="/google-signup"
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all duration-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
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
