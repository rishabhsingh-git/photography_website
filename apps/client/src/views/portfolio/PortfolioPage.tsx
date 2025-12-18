import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useCategories } from "../../hooks/useCategories";
import { usePortfolio } from "../../hooks/usePortfolio";
import { Badge } from "../../ui/primitives/Badge";
import { Modal } from "../../ui/primitives/Modal";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useResponsive } from "../../hooks/useResponsive";

const fallbackImages: Record<string, string[]> = {
  wedding: [
    "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1200&q=80&sat=-50",
  ],
  prewedding: [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1200&q=80&sat=-50",
  ],
  indoor: [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
  ],
  drone: [
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  ],
  birthday: [
    "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1200&q=80",
  ],
};

const PortfolioPage: React.FC = () => {
  const { categoriesQuery } = useCategories();
  const [params, setParams] = useSearchParams();
  const activeSlug = params.get("category") ?? undefined;
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesQuery?.data) ? categoriesQuery?.data : [];
  const activeCategoryId = useMemo(
    () => categories.find((c) => c.slug === activeSlug)?.id,
    [activeSlug, categories]
  );
  const { isMobile } = useResponsive();
  const portfolioQuery = usePortfolio(activeCategoryId);
  const [lightbox, setLightbox] = useState<string | null>(null);

  // Ensure portfolio data is always an array
  const portfolioData = Array.isArray(portfolioQuery?.data) ? portfolioQuery?.data : [];
  const images =
    portfolioData.map((a) => a.url).length > 0
      ? portfolioData.map((a) => a.url)
      : (activeSlug && fallbackImages[activeSlug]) ?? fallbackImages.wedding;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Portfolio</p>
        <h1 className="text-3xl font-semibold text-slate-50">Cinematic frames, category-first.</h1>
        <p className="text-slate-400">
          Live categories from admin. Changes propagate instantly via React Query caching.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          key="all"
          variant={!activeSlug ? "default" : "muted"}
          className="cursor-pointer"
          onClick={() => setParams({})}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.id}
            variant={cat.slug === activeSlug ? "default" : "muted"}
            className="cursor-pointer"
            onClick={() => setParams({ category: cat.slug })}
          >
            {cat.name}
          </Badge>
        ))}
      </div>

      {portfolioQuery.isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!portfolioQuery.isLoading && (
        <div className="columns-1 sm:columns-2 md:columns-3 gap-3 space-y-3">
          {images.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt="Portfolio"
              className="w-full rounded-2xl border border-slate-800 cursor-pointer hover:opacity-90 transition"
              onClick={() => setLightbox(src)}
              loading="lazy"
            />
          ))}
        </div>
      )}

      <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Preview">
        {lightbox && (
          <img
            src={lightbox}
            alt="Preview"
            className="w-full h-[60vh] object-contain rounded-xl"
          />
        )}
      </Modal>
    </div>
  );
};

export default PortfolioPage;


