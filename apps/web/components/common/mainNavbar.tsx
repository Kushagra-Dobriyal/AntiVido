// packages/ui/src/Navbar.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full border-b border-gray-800 bg-black text-white mb-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          YourBrand
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-8 text-sm">
          <Link href="/" className="hover:text-gray-300">Home</Link>
          <Link href="/projects" className="hover:text-gray-300">Projects</Link>
          <Link href="/about" className="hover:text-gray-300">About</Link>
          <Link href="/contact" className="hover:text-gray-300">Contact</Link>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-300 hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 text-sm">
          <Link href="/" onClick={() => setOpen(false)} className="block">Home</Link>
          <Link href="/projects" onClick={() => setOpen(false)} className="block">Projects</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="block">About</Link>
          <Link href="/contact" onClick={() => setOpen(false)} className="block">Contact</Link>

          <div className="pt-4 border-t border-gray-700">
            <Link href="/login" className="block mb-2">Login</Link>
            <Link
              href="/signup"
              className="block bg-white text-black px-4 py-2 rounded-lg text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};