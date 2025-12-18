import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>© {year} Cine Stories Studio.</span>
          <span>All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/portfolio" className="hover:text-slate-200 transition-colors">
            Portfolio
          </Link>
          <Link to="/services" className="hover:text-slate-200 transition-colors">
            Services
          </Link>
          <Link to="/contact" className="hover:text-slate-200 transition-colors">
            Contact
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://behance.net"
            target="_blank"
            rel="noreferrer"
            className="hover:text-slate-200 transition-colors"
          >
            Behance
          </a>
        </div>
      </div>
    </footer>
  );
};


