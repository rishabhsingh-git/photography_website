import React from "react";

export const PageSkeleton: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-4xl space-y-4 px-4">
        <div className="h-8 w-40 bg-slate-800/60 rounded-md animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-800/60 rounded-md animate-pulse" />
          <div className="h-4 w-5/6 bg-slate-800/60 rounded-md animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-800/60 rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );
};


