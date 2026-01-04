// app/components/Navbar.js
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-emerald-950 text-white p-4 shadow-lg transition-colors duration-200">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <div className='text-gray-200'>
            <h1 className="text-2xl font-bold">
              <Link href="/" >
                AccessAudit
              </Link>
            </h1>
            <p className="text-sm md:text-base">
              Accessibility Analyzer
            </p>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />

            {status === 'loading' ? (
              <div className="text-gray-200 dark:text-blue-200">Loading...</div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-200">
                  Welcome, {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-3 py-1 rounded transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/auth/signin"
                  className="px-3 py-1 rounded hover:underline text-gray-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-3 py-1 rounded transition-colors duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded hover:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-emerald-800">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-200">Theme:</span>
                <ThemeToggle />
              </div>

              {status === 'loading' ? (
                <div className="text-gray-200 dark:text-blue-200">Loading...</div>
              ) : session ? (
                <>
                  <div className="text-gray-200 py-2">
                    Welcome, {session.user.name || session.user.email}
                  </div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-3 py-2 rounded transition-colors duration-200 text-left w-full"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/auth/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-3 py-2 rounded hover:bg-emerald-900 text-gray-200 transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-black px-3 py-2 rounded transition-colors duration-200 text-center"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}