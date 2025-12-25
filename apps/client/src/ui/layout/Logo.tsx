import React from "react";
import { Link } from "react-router-dom";
import LogoImage from "../../assets/Logo.png";

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <Link 
      to="/" 
      className={`flex items-center gap-3 group ${className}`}
    >
      {/* Logo Image - Made bigger */}
      <div className="relative h-14 flex items-center">
        <img
          src={LogoImage}
          alt="Cine Stories Logo"
          className="h-full w-auto max-h-14 object-contain group-hover:scale-105 transition-transform duration-300"
          style={{
            imageRendering: '-webkit-optimize-contrast',
          }}
          onError={(e) => {
            console.error('Logo image failed to load:', LogoImage);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full rounded-lg pointer-events-none" />
      </div>
      
      {/* Cine Stories Text */}
      <span className="font-bold tracking-tight text-xl text-white whitespace-nowrap">
        Cine Stories
      </span>
    </Link>
  );
};

