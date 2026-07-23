// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16 border-t border-gray-800 absolute bottom-0 w-full">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Logo / About */}
        <div>
          <h2 className="text-xl font-semibold">YourBrand</h2>
          <p className="text-gray-400 mt-3 text-sm">
            Building modern web experiences with performance and scalability in mind.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-medium mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/projects">Projects</Link></li>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h3 className="font-medium mb-3">Connect</h3>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><a href="https://github.com" target="_blank">GitHub</a></li>
            <li><a href="https://linkedin.com" target="_blank">LinkedIn</a></li>
            <li><a href="https://twitter.com" target="_blank">Twitter</a></li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} YourBrand. All rights reserved.
      </div>
    </footer>
  );
}