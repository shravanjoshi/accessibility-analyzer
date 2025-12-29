// app/components/Navbar.js
'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-blue-600 dark:bg-blue-800 text-white p-4 shadow-lg transition-colors duration-200">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">
            <Link href="/" className="hover:text-blue-200 transition-colors">
              AccessAudit  - Accessibility Analyzer
            </Link>
          </h1>
          <p className="text-blue-100 dark:text-blue-200">
            Comprehensive web accessibility testing
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          
          {status === 'loading' ? (
            <div className="text-blue-100 dark:text-blue-200">Loading...</div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <span className="text-">
                Welcome, {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="cursor-pointer bg-gray-50 hover:bg-gray-200 text-blue-600 px-3 py-1 rounded transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                href="/auth/signin"
                className="bg-blue-700 dark:bg-blue-900 hover:bg-blue-800 dark:hover:bg-blue-700 px-3 py-1 rounded transition-colors duration-200"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="cursor-pointer bg-gray-50 hover:bg-gray-200 text-blue-600 px-3 py-1 rounded transition-colors duration-200"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}