import React from "react";
import { useServices } from "../../hooks/useServices";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Button } from "../../ui/primitives/Button";
import { Badge } from "../../ui/primitives/Badge";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const ServicesPage: React.FC = () => {
  const { servicesQuery, addToCart } = useServices();
  const { add } = useToastStore();
  // Ensure services is always an array
  const services = Array.isArray(servicesQuery?.data) ? servicesQuery?.data : [];

  const handleAdd = async (id: string) => {
    try {
      await addToCart.mutateAsync(id);
      add({ title: "Added to cart", kind: "success" });
    } catch (err: any) {
      add({
        title: "Unable to add",
        description: err?.response?.data?.message ?? "Try again",
        kind: "error",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Services</p>
        <h1 className="text-3xl font-semibold text-slate-50">Curated photography experiences.</h1>
        <p className="text-slate-400">Add to cart or book instantly. Cart syncs with backend.</p>
      </div>

      {servicesQuery.isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!servicesQuery.isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="border-slate-800/80 hover:border-slate-700/80 transition-colors">
              {service.imageUrl && (
                <div className="h-48 w-full overflow-hidden rounded-t-2xl">
                  <img src={service.imageUrl} alt={service.title} className="h-full w-full object-cover" />
                </div>
              )}
              <CardContent className="space-y-3 p-6">
                <div className="space-y-2">
                  {service.icon && <div className="text-3xl mb-2">{service.icon}</div>}
                  <h3 className="text-xl font-semibold text-slate-50">{service.title}</h3>
                  {service.slogan && (
                    <p className="text-sm text-slate-400 italic">{service.slogan}</p>
                  )}
                  {service.description && (
                    <p className="text-slate-400 text-sm line-clamp-2">{service.description}</p>
                  )}
                  {service.highlights && service.highlights.length > 0 && (
                    <ul className="text-xs text-slate-500 space-y-1">
                      {service.highlights.slice(0, 3).map((highlight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-slate-600">•</span>
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div>
                    {service.discountedPrice ? (
                      <div className="space-y-1">
                        <p className="text-xl font-semibold text-slate-50">
                          ₹{service.discountedPrice.toLocaleString("en-IN")}
                        </p>
                        <p className="text-sm text-slate-500 line-through">
                          ₹{service.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xl font-semibold text-slate-50">
                        ₹{service.price.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1" onClick={() => handleAdd(service.id)} loading={addToCart.isPending}>
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;


