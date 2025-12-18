import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";

const featuredCategories = [
  {
    name: "Wedding Stories",
    image: "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1400&q=80",
    cta: "/portfolio?category=wedding",
  },
  {
    name: "Pre-Wedding",
    image: "https://images.unsplash.com/photo-1520854221050-0f4caff449fb?auto=format&fit=crop&w=1400&q=80",
    cta: "/portfolio?category=prewedding",
  },
  {
    name: "Indoor Portraits",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80",
    cta: "/portfolio?category=indoor",
  },
  {
    name: "Drone Aerials",
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
    cta: "/portfolio?category=drone",
  },
];

const quickLinks = [
  { label: "View Portfolio", href: "/portfolio" },
  { label: "Book a Session", href: "/services" },
  { label: "Manage Cart", href: "/cart" },
  { label: "Contact Studio", href: "/contact" },
];

const UserDashboardPage: React.FC = () => {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: "start" });

  return (
    <div className="space-y-10">
      <section className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cine Stories Studio</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-50">
            Capture weddings, pre-weddings, indoor portraits, and aerial wonders.
          </h1>
          <p className="text-slate-400 text-lg">
            Book premium photography with cinematic storytelling, razor-sharp delivery, and
            secure online proofing.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => (window.location.href = "/services")}>
              Book a Session
            </Button>
            <Button variant="secondary" size="lg" onClick={() => (window.location.href = "/portfolio")}>
              Explore Portfolio
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Wedding", "Pre-Wedding", "Indoor", "Drone", "Birthday"].map((tag) => (
              <Badge key={tag} variant="muted">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          <img
            src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 via-slate-900/10 to-transparent" />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Categories</h2>
          <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/portfolio")}>
            View all
          </Button>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {featuredCategories.map((item) => (
              <div
                key={item.name}
                className="min-w-[260px] md:min-w-[300px] rounded-2xl border border-slate-800 overflow-hidden relative group"
              >
                <img src={item.image} alt={item.name} className="h-52 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                <div className="absolute bottom-0 p-4 space-y-2">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => (window.location.href = item.cta)}
                  >
                    Open
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link) => (
          <Card key={link.label} className="hover:border-sky-500/50 transition-colors">
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-400">Quick action</p>
              <h3 className="text-lg font-semibold">{link.label}</h3>
              <Button variant="ghost" size="sm" onClick={() => (window.location.href = link.href)}>
                Go
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default UserDashboardPage;


