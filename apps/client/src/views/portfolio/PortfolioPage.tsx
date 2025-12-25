import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useServices } from "../../hooks/useServices";
import { usePortfolio } from "../../hooks/usePortfolio";
import { Badge } from "../../ui/primitives/Badge";
import { Modal } from "../../ui/primitives/Modal";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useResponsive } from "../../hooks/useResponsive";

const PortfolioPage: React.FC = () => {
  const { servicesQuery } = useServices();
  const [params, setParams] = useSearchParams();
  const activeServiceId = params.get("service") ?? undefined;
  const { isMobile } = useResponsive();
  
  // Fetch all assets for "All Services" view
  const allPortfolioQuery = usePortfolio(undefined, undefined);
  // Fetch filtered assets for specific service view
  const portfolioQuery = usePortfolio(undefined, activeServiceId);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const allServices = Array.isArray(servicesQuery?.data) ? servicesQuery?.data : [];
  // Only show active services in the portfolio
  const services = allServices.filter(s => s.isActive);
  
  // Use all assets when no service is selected, filtered assets when service is selected
  const portfolioData = activeServiceId 
    ? (Array.isArray(portfolioQuery?.data) ? portfolioQuery.data : [])
    : (Array.isArray(allPortfolioQuery?.data) ? allPortfolioQuery.data : []);
  
  // Force refetch on mount and when service filter changes
  useEffect(() => {
    console.log('🚀 [PortfolioPage] Component mounted or service changed, activeServiceId:', activeServiceId);
    if (activeServiceId) {
      console.log('🔄 [PortfolioPage] Refetching portfolio for service:', activeServiceId);
      portfolioQuery.refetch().catch(err => {
        console.error('❌ [PortfolioPage] Service portfolio refetch error:', err);
      });
    } else {
      console.log('🔄 [PortfolioPage] Refetching all portfolio assets...');
      allPortfolioQuery.refetch().catch(err => {
        console.error('❌ [PortfolioPage] All portfolio refetch error:', err);
      });
    }
  }, [activeServiceId]);

  // Force refetch on initial mount
  useEffect(() => {
    console.log('🚀 [PortfolioPage] Component mounted, forcing initial refetch...');
    allPortfolioQuery.refetch().catch(err => {
      console.error('❌ [PortfolioPage] Initial all portfolio refetch error:', err);
    });
    portfolioQuery.refetch().catch(err => {
      console.error('❌ [PortfolioPage] Initial service portfolio refetch error:', err);
    });
  }, []); // Only run on mount

  console.log('📊 [PortfolioPage] Services:', {
    total: allServices.length,
    active: services.length,
    activeServiceId,
    services: services.map(s => ({ id: s.id, title: s.title, isActive: s.isActive })),
  });
  
  console.log('📊 [PortfolioPage] Portfolio data:', {
    count: portfolioData.length,
    activeServiceId,
    allPortfolioCount: Array.isArray(allPortfolioQuery?.data) ? allPortfolioQuery.data.length : 0,
    servicePortfolioCount: Array.isArray(portfolioQuery?.data) ? portfolioQuery.data.length : 0,
    allPortfolioQueryState: {
      isLoading: allPortfolioQuery.isLoading,
      isFetching: allPortfolioQuery.isFetching,
      isError: allPortfolioQuery.isError,
    },
    servicePortfolioQueryState: {
      isLoading: portfolioQuery.isLoading,
      isFetching: portfolioQuery.isFetching,
      isError: portfolioQuery.isError,
    },
    assets: portfolioData.slice(0, 3).map(a => ({ id: a.id, serviceId: a.serviceId, serviceTitle: a.service?.title })),
  });

  // Group assets by service for better organization
  const assetsByService = useMemo(() => {
    const grouped: Record<string, typeof portfolioData> = {};
    portfolioData.forEach((asset) => {
      const serviceId = asset.serviceId || 'uncategorized';
      if (!grouped[serviceId]) grouped[serviceId] = [];
      grouped[serviceId].push(asset);
    });
    return grouped;
  }, [portfolioData]);

  const activeService = services.find(s => s.id === activeServiceId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium">Portfolio</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-50">
            {activeService ? activeService.title : "Our Work"}
          </h1>
          {activeService?.description ? (
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              {activeService.description}
            </p>
          ) : (
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Explore our collection of stunning photography and videography
            </p>
          )}
        </div>

        {/* Service Filter Badges */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          <button
            onClick={() => setParams({})}
            className="cursor-pointer px-4 py-2 text-sm md:text-base hover:scale-105 transition-transform"
          >
            <Badge
              variant={!activeServiceId ? "default" : "muted"}
            >
              All Services
            </Badge>
          </button>
          {services.map((service) => {
            // When viewing "All Services", count assets from the grouped data
            // When viewing a specific service, the portfolioData is already filtered
            const serviceAssets = activeServiceId 
              ? (activeServiceId === service.id ? portfolioData : [])
              : (assetsByService[service.id] || []);
            return (
              <button
                key={service.id}
                onClick={() => {
                  console.log('🖱️ [PortfolioPage] Service clicked:', service.id, service.title);
                  setParams({ service: service.id });
                }}
                className="cursor-pointer px-4 py-2 text-sm md:text-base hover:scale-105 transition-transform"
              >
                <Badge
                  variant={service.id === activeServiceId ? "default" : "muted"}
                  className="flex items-center gap-2"
                >
                  {service.icon && <span>{service.icon}</span>}
                  <span>{service.title}</span>
                  {serviceAssets.length > 0 && (
                    <span className="text-xs opacity-75">({serviceAssets.length})</span>
                  )}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {(portfolioQuery.isLoading || allPortfolioQuery.isLoading) && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Portfolio Grid */}
        {!(portfolioQuery.isLoading || allPortfolioQuery.isLoading) && portfolioData.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <p className="text-slate-400 text-lg">No assets found</p>
            <p className="text-slate-500 text-sm mt-2">
              {activeServiceId ? "This service doesn't have any assets yet" : "No assets available"}
            </p>
          </div>
        )}

        {!(portfolioQuery.isLoading || allPortfolioQuery.isLoading) && portfolioData.length > 0 && (
          <div className={`columns-1 ${isMobile ? 'sm:columns-2' : 'md:columns-3 lg:columns-4'} gap-3 md:gap-4 space-y-3 md:space-y-4`}>
            {portfolioData.map((asset, idx) => {
              const isVideo = /\.(mp4|webm|ogg)$/i.test(asset.url) || asset.url.includes('video');
              return (
                <div
                  key={asset.id || idx}
                  className="group relative w-full rounded-xl border border-slate-800 overflow-hidden cursor-pointer hover:border-slate-700 transition-all break-inside-avoid mb-3 md:mb-4 bg-slate-900/50 backdrop-blur-sm"
                  onClick={() => setLightbox(asset.url)}
                >
                  <div className="relative w-full">
                    {isVideo ? (
                      <video
                        src={asset.url}
                        className="w-full h-auto object-cover rounded-xl"
                        muted
                        playsInline
                        preload="metadata"
                        onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLVideoElement).pause();
                          (e.currentTarget as HTMLVideoElement).currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={asset.url}
                        alt={asset.title || "Portfolio"}
                        className="w-full h-auto object-contain rounded-xl group-hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                        style={{ 
                          imageRendering: 'auto',
                          imageRendering: '-webkit-optimize-contrast',
                        }}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {asset.service && (
                      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="default" className="text-xs">
                          {asset.service.icon} {asset.service.title}
                        </Badge>
                      </div>
                    )}
                    {asset.title && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white font-medium text-sm">{asset.title}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Lightbox Modal */}
        <Modal open={!!lightbox} onClose={() => setLightbox(null)} title="Preview">
          {lightbox && (
            <div className="relative">
              {/\.(mp4|webm|ogg)$/i.test(lightbox) || lightbox.includes('video') ? (
                <video
                  src={lightbox}
                  className="w-full h-[60vh] md:h-[70vh] object-contain rounded-xl"
                  controls
                  autoPlay
                />
              ) : (
                <img
                  src={lightbox}
                  alt="Preview"
                  className="w-full max-h-[80vh] object-contain rounded-xl"
                  style={{ 
                    imageRendering: 'auto',
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                  loading="eager"
                />
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default PortfolioPage;
