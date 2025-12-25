import React, { useState } from "react";
import { Button } from "../../ui/primitives/Button";
import { Input } from "../../ui/primitives/Input";
import { Select } from "../../ui/primitives/Select";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";
import { useServices } from "../../hooks/useServices";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { api } from "../../api/client";
import AvatarImage from "../../assets/Avatar.jpeg";

const ContactPage: React.FC = () => {
  const { servicesQuery } = useServices();
  const { add } = useToastStore();
  const services = Array.isArray(servicesQuery?.data) ? servicesQuery.data.filter(s => s.isActive) : [];
  
  // Force refetch services on mount
  React.useEffect(() => {
    if (!servicesQuery.data) {
      servicesQuery.refetch();
    }
  }, []);

  console.log('📞 [ContactPage] Services loaded:', {
    total: services.length,
    services: services.map(s => ({ id: s.id, title: s.title, icon: s.icon })),
    isLoading: servicesQuery.isLoading,
  });
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    serviceId: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse for 3D effects
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePosition({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      console.log('📤 [ContactPage] Submitting form:', {
        ...form,
        serviceId: form.serviceId || 'none selected',
        selectedService: services.find(s => s.id === form.serviceId)?.title || 'none',
      });
      
      // Prepare payload - use serviceId (not categoryId)
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        serviceId: form.serviceId || undefined, // Only include if selected
        message: form.message,
      };
      
      await api.post("/contact", payload);
      add({ title: "Message sent", description: "We will reach out shortly", kind: "success" });
      setForm({ name: "", email: "", phone: "", serviceId: "", message: "" });
    } catch (err: any) {
      console.error('❌ [ContactPage] Form submission error:', err);
      add({
        title: "Failed to send",
        description: err?.response?.data?.message ?? "Please retry",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* 3D Background Effects */}
      <div 
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          transform: `translate(${mousePosition.x * 20}px, ${mousePosition.y * 20}px)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-gradient-to-br from-sky-500/20 via-blue-500/15 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 md:gap-16 items-start">
          {/* Left Side - Photographer Info with Avatar */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-pink-500/30 to-purple-500/30 border-pink-500/50 text-pink-200 px-4 py-1.5">
                Get in Touch
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-sky-400">
                  Let's Create Something
                </span>
                <br />
                <span className="text-slate-50">Amazing Together</span>
              </h1>
              <p className="text-slate-300 text-lg md:text-xl leading-relaxed">
                Have a project in mind? Want to book a session? Or just want to say hello?
                I'd love to hear from you. Let's bring your vision to life.
              </p>
            </div>

            {/* Photographer Avatar Card with 3D Effect */}
            <div
              className="relative"
              style={{
                transform: `perspective(1200px) rotateY(${mousePosition.x * 5}deg) rotateX(${-mousePosition.y * 3}deg)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <Card className="border-2 border-slate-800/70 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl overflow-hidden hover:border-sky-500/70 transition-all duration-500 hover:shadow-2xl hover:shadow-sky-500/30">
                <CardContent className="p-0">
                  <div className="relative">
                    {/* Avatar Image with Cool Frame */}
                    <div className="relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-sky-500/20 blur-2xl opacity-50" />
                      <div className="relative p-8 md:p-12">
                        <div className="relative mx-auto w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-slate-800/50 shadow-2xl group">
                          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/30 via-purple-500/30 to-sky-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                          <img
                            src={AvatarImage}
                            alt="Photographer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 relative z-0"
                            style={{
                              imageRendering: '-webkit-optimize-contrast',
                            }}
                          />
                          <div className="absolute inset-0 ring-4 ring-sky-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Photographer Info */}
                    <div className="px-8 pb-8 space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-50">
                          Cine Stories
                        </h3>
                        <p className="text-slate-400 text-sm md:text-base">
                          Professional Photographer & Cinematographer
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap justify-center gap-3">
                        <Badge variant="default" className="bg-sky-500/20 border-sky-500/50 text-sky-200">
                          📸 Photography
                        </Badge>
                        <Badge variant="default" className="bg-pink-500/20 border-pink-500/50 text-pink-200">
                          🎬 Cinematography
                        </Badge>
                        <Badge variant="default" className="bg-purple-500/20 border-purple-500/50 text-purple-200">
                          ✨ Creative Direction
                        </Badge>
                      </div>

                      <div className="pt-4 border-t border-slate-800 space-y-3">
                        <div className="flex items-center justify-center gap-3 text-slate-300">
                          <span className="text-lg">📧</span>
                          <span className="text-sm md:text-base">hello@cinestories.com</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-slate-300">
                          <span className="text-lg">📱</span>
                          <span className="text-sm md:text-base">+91 98765 43210</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="space-y-6">
            <Card className="border-2 border-slate-800/70 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl">
              <CardContent className="p-6 md:p-8">
                <div className="space-y-2 mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-50">Send us a message</h2>
                  <p className="text-slate-400 text-sm">Fill out the form below and we'll get back to you soon.</p>
                </div>

                <form className="space-y-5" onSubmit={submit}>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Name *</label>
                      <Input
                        required
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="bg-slate-900/50 border-slate-800/70 focus:border-sky-500/70 focus:ring-sky-500/20"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Email *</label>
                      <Input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        className="bg-slate-900/50 border-slate-800/70 focus:border-sky-500/70 focus:ring-sky-500/20"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Phone *</label>
                      <Input
                        required
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        className="bg-slate-900/50 border-slate-800/70 focus:border-sky-500/70 focus:ring-sky-500/20"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Service Interest</label>
                      {servicesQuery.isLoading ? (
                        <div className="w-full rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-400">
                          Loading services...
                        </div>
                      ) : services.length === 0 ? (
                        <div className="w-full rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-500">
                          No services available
                        </div>
                      ) : (
                        <Select
                          value={form.serviceId}
                          onChange={(e) => {
                            const selectedServiceId = e.target.value;
                            console.log('📝 [ContactPage] Service selected:', {
                              serviceId: selectedServiceId,
                              service: services.find(s => s.id === selectedServiceId)?.title,
                            });
                            setForm((f) => ({ ...f, serviceId: selectedServiceId }));
                          }}
                          className="bg-slate-900/50 border-slate-800/70 focus:border-sky-500/70 focus:ring-sky-500/20 text-slate-50"
                        >
                          <option value="" className="bg-slate-900">Select a service (optional)</option>
                          {services.map((service) => (
                            <option key={service.id} value={service.id} className="bg-slate-900">
                              {service.icon} {service.title}
                            </option>
                          ))}
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Message *</label>
                    <textarea
                      required
                      className="w-full rounded-xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-50 placeholder:text-slate-500 focus:border-sky-500/70 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all duration-200 resize-none"
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder="Tell us about your project, event, or any questions you have..."
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    loading={submitting}
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 transform hover:scale-[1.02] transition-all duration-300"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Additional Info Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-2 border-slate-800/70 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl hover:border-sky-500/50 transition-all duration-300">
                <CardContent className="p-5 text-center space-y-2">
                  <div className="text-3xl mb-2">⚡</div>
                  <h3 className="text-sm font-semibold text-slate-50">Quick Response</h3>
                  <p className="text-xs text-slate-400">We typically respond within 24 hours</p>
                </CardContent>
              </Card>
              <Card className="border-2 border-slate-800/70 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-xl hover:border-pink-500/50 transition-all duration-300">
                <CardContent className="p-5 text-center space-y-2">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="text-sm font-semibold text-slate-50">Custom Packages</h3>
                  <p className="text-xs text-slate-400">Tailored solutions for your needs</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
