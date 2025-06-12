import React, { useState, useEffect, useRef } from "react";
import { FaBars, FaTimes, FaUser, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useDebug } from '../context/DebugContext';
import { ROUTES } from '../constants';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isV2, setIsV2] = useState(true);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const profileMenuRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode, toggleTheme } = useTheme();
    const { isDebugMode, toggleDebugMode } = useDebug();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const checkAuth = () => {
            const user = localStorage.getItem('user');
            setIsAuthenticated(!!user);
        };

        // Check auth state on mount
        checkAuth();

        // Listen for auth state changes
        window.addEventListener('storage', (e) => {
            if (e.key === 'user') {
                checkAuth();
            }
        });

        // Listen for custom auth event
        window.addEventListener('authStateChanged', checkAuth);

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('authStateChanged', checkAuth);
        };
    }, []);

    useEffect(() => {
        setIsV2(location.pathname === ROUTES.V2 || location.pathname === ROUTES.HOME);
    }, [location.pathname]);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogoClick = (e) => {
        e.preventDefault();
        navigate(ROUTES.HOME);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleAuthButtonClick = () => {
        if (isAuthenticated) {
            navigate(ROUTES.DASHBOARD);
        } else {
            navigate(ROUTES.SIGNUP);
        }
    };

    const toggleVersion = () => {
        setIsV2(!isV2);
        navigate(isV2 ? ROUTES.V1 : ROUTES.V2);
    };

    const handleSignOut = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        window.dispatchEvent(new Event('authStateChanged'));
        navigate('/');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav
            className={`fixed w-full z-50 transition-all duration-300 ${
                scrolled
                    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm"
                    : "bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link
                            to="/"
                            onClick={handleLogoClick}
                            className="flex items-center text-2xl font-bold text-gray-900 dark:text-white"
                        >
                            <span className="flex items-center justify-center w-8 h-8 mr-2 bg-indigo-600 text-white rounded-lg font-bold">
                                A
                            </span>
                            AlgoTrader
                        </Link>
                </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/"
                            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Home
                        </Link>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={toggleVersion}
                                className={`p-2 rounded-md ${
                                    isV2
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                }`}
                                title="Toggle v1/v2"
                            >
                                {isV2 ? 'v2' : 'v1'}
                            </button>
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
                            <button
                                onClick={handleAuthButtonClick}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                    isAuthenticated
                                        ? 'bg-green-600 hover:bg-green-700 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                }`}
                            >
                                {isAuthenticated ? 'Dashboard' : 'Get Started'}
                            </button>
                            {isAuthenticated && (
                                <div className="relative" ref={profileMenuRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        title="Profile"
                                    >
                                        <FaUser className="h-5 w-5" />
                                    </button>
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    role="menuitem"
                                                    onClick={() => setShowProfileMenu(false)}
                                                >
                                                    <FaUser className="h-4 w-4 mr-2" />
                                                    Profile
                                                </Link>
                    <button
                                                    onClick={() => {
                                                        handleSignOut();
                                                        setShowProfileMenu(false);
                                                    }}
                                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    role="menuitem"
                                                >
                                                    <FaSignOutAlt className="h-4 w-4 mr-2" />
                                                    Sign Out
                    </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                </div>

                {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                <button
                    onClick={toggleMenu}
                            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none"
                        >
                            {isOpen ? (
                                <FaTimes className="h-6 w-6" />
                            ) : (
                                <FaBars className="h-6 w-6" />
                            )}
                </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
                        <Link
                            to="/"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors"
                        >
                            Home
                        </Link>
                        <button
                            onClick={toggleVersion}
                            className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                isV2
                                    ? 'bg-indigo-600 text-white'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                            {isV2 ? 'v2' : 'v1'}
                        </button>
                        <button
                            onClick={handleAuthButtonClick}
                            className={`w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                                isAuthenticated
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {isAuthenticated ? 'Dashboard' : 'Get Started'}
                        </button>
                        {isAuthenticated && (
                            <>
                                <Link
                                    to="/profile"
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors"
                                >
                                    Profile
                                </Link>
                <button
                                    onClick={handleSignOut}
                                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors"
                >
                                    Sign Out
                </button>
                            </>
                        )}
                    </div>
            </div>
            )}
        </nav>
    );
}
