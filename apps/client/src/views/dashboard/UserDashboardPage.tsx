import React, { useEffect, useCallback, useState, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";
import { useCarousel } from "../../hooks/useCarousel";
import { useServices } from "../../hooks/useServices";
import { Skeleton } from "../../ui/skeletons/Skeleton";

const quickLinks = [
  { label: "View Portfolio", href: "/portfolio", icon: "📸" },
  { label: "Book a Session", href: "/services", icon: "📅" },
  { label: "Manage Cart", href: "/cart", icon: "🛒" },
  { label: "Contact Studio", href: "/contact", icon: "💬" },
];


const UserDashboardPage: React.FC = () => {
  console.log('🚀 [UserDashboardPage] Component rendering...');

  // Carousel refs
  const [servicesEmblaRef, servicesEmblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "center",
    slidesToScroll: 1,
    dragFree: true,
  });

  const [workEmblaRef, workEmblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });
  
  // 3D Mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced mouse tracking for 3D parallax
  useEffect(() => {
    console.log('🖱️ [UserDashboardPage] Setting up mouse tracking...');
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Auto-scroll services carousel
  const scrollServicesNext = useCallback(() => {
    if (servicesEmblaApi) {
      console.log('▶️ [UserDashboardPage] Scrolling services carousel');
      servicesEmblaApi.scrollNext();
    }
  }, [servicesEmblaApi]);

  // Auto-scroll work carousel
  const scrollWorkNext = useCallback(() => {
    if (workEmblaApi) {
      console.log('▶️ [UserDashboardPage] Scrolling work carousel');
      workEmblaApi.scrollNext();
    }
  }, [workEmblaApi]);

  useEffect(() => {
    if (!servicesEmblaApi) return;
    console.log('⏰ [UserDashboardPage] Setting up services carousel autoplay');
    const autoplay = setInterval(() => {
      scrollServicesNext();
    }, 5000);
    return () => clearInterval(autoplay);
  }, [servicesEmblaApi, scrollServicesNext]);

  useEffect(() => {
    if (!workEmblaApi) return;
    console.log('⏰ [UserDashboardPage] Setting up work carousel autoplay');
    const autoplay = setInterval(() => {
      scrollWorkNext();
    }, 4000);
    return () => clearInterval(autoplay);
  }, [workEmblaApi, scrollWorkNext]);
  
  // Fetch data - FORCE REFETCH
  const carouselQuery = useCarousel(6);
  const { servicesQuery } = useServices();
  
  // Force refetch on mount
  useEffect(() => {
    console.log('🔄 [UserDashboardPage] Forcing data refetch...');
    carouselQuery.refetch();
    servicesQuery.refetch();
  }, []);

  const carouselImages = Array.isArray(carouselQuery?.data) ? carouselQuery.data : [];
  const services = Array.isArray(servicesQuery?.data) ? servicesQuery.data.filter(s => s.isActive) : [];

  console.log('📊 [UserDashboardPage] Current state:', {
    imagesCount: carouselImages.length,
    servicesCount: services.length,
    carouselLoading: carouselQuery.isLoading,
    carouselError: carouselQuery.isError,
    servicesLoading: servicesQuery.isLoading,
    servicesError: servicesQuery.isError,
    mouseX: mousePosition.x.toFixed(2),
    mouseY: mousePosition.y.toFixed(2),
  });

  return (
    <div 
      ref={containerRef} 
      className="min-h-screen relative overflow-x-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
      style={{ overflowY: 'auto' }}
    >
      {/* Enhanced 3D Background Effects - ALWAYS VISIBLE */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePosition.x * 40}px, ${mousePosition.y * 40}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/40 via-purple-500/30 to-transparent rounded-full blur-3xl"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/40 via-orange-500/30 to-transparent rounded-full blur-3xl"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '1.5s',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-sky-500/40 via-blue-500/30 to-transparent rounded-full blur-3xl"
          style={{ 
            animation: 'pulse 4s ease-in-out infinite',
            animationDelay: '3s',
          }}
        />
      </div>

      {/* Floating particles effect - ALWAYS VISIBLE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white/30 rounded-full"
            style={{
              left: `${(i * 3.33) % 100}%`,
              top: `${(i * 7) % 100}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${(i * 0.2) % 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-16 md:space-y-24 py-8 md:py-16">
        {/* Hero Section with Enhanced 3D Effects */}
        <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center px-4 md:px-6">
          <div 
            className="space-y-6 md:space-y-8"
            style={{
              transform: `perspective(1500px) rotateY(${mousePosition.x * 8}deg) rotateX(${-mousePosition.y * 5}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            <div className="inline-block">
              <Badge className="bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-500/50 text-pink-200 px-4 py-1.5">
                ✨ Cine Stories Studio
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
              <span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400"
                style={{
                  backgroundSize: '200% 200%',
                  animation: 'gradient-shift 3s ease infinite',
                }}
              >
            Capture weddings, pre-weddings, indoor portraits, and aerial wonders.
              </span>
          </h1>
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed max-w-xl">
            Book premium photography with cinematic storytelling, razor-sharp delivery, and
            secure online proofing.
          </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => (window.location.href = "/services")}
                className="transform hover:scale-110 transition-all duration-300 shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0"
              >
              Book a Session
            </Button>
              <Button 
                variant="secondary" 
                size="lg" 
                onClick={() => (window.location.href = "/portfolio")}
                className="transform hover:scale-110 transition-all duration-300 border-2 border-slate-700 hover:border-slate-600"
              >
              Explore Portfolio
            </Button>
          </div>
        </div>
          <div 
            className="relative rounded-3xl overflow-hidden border-2 border-slate-800/70 shadow-2xl group"
            style={{
              transform: `perspective(1500px) rotateY(${-mousePosition.x * 10}deg) rotateX(${mousePosition.y * 6}deg) scale(1.05)`,
              transition: 'transform 0.3s ease-out',
            }}
          >
            {carouselQuery.isLoading ? (
              <Skeleton className="w-full h-[400px] md:h-[500px]" />
            ) : carouselImages.length > 0 ? (
              <>
                <img
                  src={carouselImages[0]?.url}
                  alt="Hero"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-110 transition-transform duration-700"
                  style={{
                    imageRendering: '-webkit-optimize-contrast',
                  }}
                  loading="eager"
                  decoding="sync"
                  onError={(e) => {
                    console.error('❌ [UserDashboardPage] Hero image failed to load:', carouselImages[0]?.url);
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/50 via-transparent to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950/80" />
              </>
            ) : (
              <div className="w-full h-[400px] md:h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-7xl animate-bounce">📸</div>
                  <p className="text-slate-400">Loading images...</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Elegant Compact Services Carousel */}
        <section className="space-y-6 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-3 bg-sky-500/30 border-sky-500/50 text-sky-200 px-3 py-1">Our Services</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-pink-400">Services</span>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => (window.location.href = "/services")}
              className="hover:scale-105 transition-transform"
            >
              View all →
            </Button>
          </div>
          
          {servicesQuery.isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[240px] md:min-w-[280px] h-[300px] rounded-2xl flex-shrink-0" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-slate-800/50">
              <div className="text-7xl mb-4 animate-pulse">🎬</div>
              <p className="text-slate-300 text-lg font-semibold mb-2">No services available yet</p>
              <p className="text-slate-500 text-sm">Check back soon for our amazing photography services!</p>
            </div>
          ) : (
            <div className="overflow-visible" ref={servicesEmblaRef}>
              <div className="flex gap-4 cursor-grab active:cursor-grabbing">
                {services.map((service, index) => (
                  <div
                    key={service.id}
                    className="min-w-[240px] md:min-w-[280px] rounded-2xl border-2 border-slate-800/70 overflow-hidden relative group cursor-pointer flex-shrink-0 hover:border-sky-500/70 transition-all duration-500"
                    onClick={() => window.location.href = `/services`}
                    style={{
                      transform: `perspective(1200px) rotateY(${mousePosition.x * (index % 2 === 0 ? 1 : -1) * 3}deg) translateZ(${Math.abs(mousePosition.x) * 20}px)`,
                      transition: 'transform 0.4s ease-out',
                    }}
                  >
                    <div className="relative h-[300px] overflow-hidden bg-slate-900">
                      {service.imageUrl ? (
                        <img
                          src={service.imageUrl}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          style={{
                            imageRendering: '-webkit-optimize-contrast',
                          }}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            console.error('❌ [UserDashboardPage] Service image failed to load:', service.imageUrl);
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-pink-500/40 via-amber-500/30 to-sky-500/40 flex items-center justify-center">
                          {service.icon && <span className="text-7xl opacity-70">{service.icon}</span>}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          {service.icon && <span className="text-xl">{service.icon}</span>}
                          <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                        </div>
                        {service.description && (
                          <p className="text-xs text-slate-200 line-clamp-2 mb-2">
                            {service.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {service.discountedPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-white">
                                  ₹{service.discountedPrice.toLocaleString()}
                                </span>
                                <span className="text-xs line-through text-slate-400">
                                  ₹{service.price.toLocaleString()}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-white">
                                ₹{service.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/services`;
                          }}
                          className="w-full transform hover:scale-105 transition-transform"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </section>

        {/* Featured Work Carousel - ALWAYS VISIBLE */}
        <section className="space-y-6 px-4 md:px-6">
        <div className="flex items-center justify-between">
            <div>
              <Badge className="mb-3 bg-purple-500/30 border-purple-500/50 text-purple-200 px-3 py-1">Portfolio</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Work</span>
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => (window.location.href = "/portfolio")}
              className="hover:scale-105 transition-transform"
            >
              View all →
          </Button>
        </div>
          
        {carouselQuery.isLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="min-w-[240px] md:min-w-[280px] h-[300px] rounded-2xl flex-shrink-0" />
            ))}
          </div>
        ) : carouselImages.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-3xl border-2 border-slate-800/50">
              <div className="text-7xl mb-4 animate-pulse">🖼️</div>
              <p className="text-slate-300 text-lg font-semibold mb-2">No images available for carousel</p>
              <p className="text-slate-500 text-sm">Check back soon for our amazing portfolio!</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  console.log('🔄 [UserDashboardPage] Manual refetch triggered');
                  carouselQuery.refetch();
                }}
              >
                Retry Loading
              </Button>
          </div>
        ) : (
            <div className="overflow-visible" ref={workEmblaRef}>
              <div className="flex gap-4 cursor-grab active:cursor-grabbing">
                {carouselImages.map((asset, index) => (
                <div
                  key={asset.id}
                    className="min-w-[240px] md:min-w-[280px] rounded-2xl border-2 border-slate-800/70 overflow-hidden relative group cursor-pointer flex-shrink-0 hover:border-sky-500/70 transition-all duration-500"
                  onClick={() => window.location.href = "/portfolio"}
                    style={{
                      transform: `perspective(1200px) rotateY(${mousePosition.x * (index % 2 === 0 ? 1 : -1) * 3}deg) translateZ(${Math.abs(mousePosition.x) * 20}px)`,
                      transition: 'transform 0.4s ease-out',
                    }}
                >
                    <div className="relative h-[300px] overflow-hidden bg-slate-900">
                  <img 
                    src={asset.url} 
                    alt={asset.title || "Portfolio"} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        style={{
                          imageRendering: '-webkit-optimize-contrast',
                        }}
                    loading="lazy"
                    decoding="async"
                        onError={(e) => {
                          console.error('❌ [UserDashboardPage] Portfolio image failed to load:', asset.url);
                        }}
                  />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  {asset.service && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                            {asset.service.icon && <span className="text-xl">{asset.service.icon}</span>}
                            <h3 className="text-lg font-semibold text-white">{asset.service.title}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                              window.location.href = `/portfolio?service=${asset.service?.id}`;
                        }}
                            className="w-full transform hover:scale-105 transition-transform"
                      >
                        View Service
                      </Button>
                    </div>
                  )}
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

        {/* Quick Links with Enhanced 3D Cards */}
        <section className="px-4 md:px-6">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-amber-500/30 border-amber-500/50 text-amber-200 px-3 py-1">Quick Actions</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-50">
              Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Started</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {quickLinks.map((link, index) => (
              <div
                key={link.label}
                onClick={() => (window.location.href = link.href)}
                className="cursor-pointer"
                style={{
                  transform: `perspective(1200px) rotateY(${mousePosition.x * (index % 2 === 0 ? 1 : -1) * 3}deg) translateZ(${Math.abs(mousePosition.x) * 15}px)`,
                  transition: 'transform 0.4s ease-out',
                }}
              >
                <Card 
                  className="h-full border-2 border-slate-800/70 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl hover:border-amber-500/70 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/30"
                >
                  <CardContent className="space-y-4 p-6 text-center">
                    <div className="text-6xl mb-2 transform group-hover:scale-110 transition-transform">{link.icon}</div>
                    <p className="text-sm text-slate-400 group-hover:text-amber-400 transition-colors uppercase tracking-wider">Quick action</p>
                    <h3 className="text-xl font-bold text-slate-50 group-hover:text-amber-300 transition-colors">{link.label}</h3>
                    <div className="flex items-center justify-center gap-2 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Explore →</span>
                    </div>
            </CardContent>
          </Card>
              </div>
        ))}
          </div>
      </section>
      </div>

      {/* Add CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-30px) rotate(180deg); opacity: 0.7; }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default UserDashboardPage;
