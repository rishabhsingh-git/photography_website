import React, { useState } from "react";
import { useAdminServices } from "../../hooks/useAdminServices";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Input } from "../../ui/primitives/Input";
import { Button } from "../../ui/primitives/Button";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const AdminServicesPage: React.FC = () => {
  const { servicesQuery, createService, updateService, deleteService } = useAdminServices();
  const { add } = useToastStore();
  // Ensure services is always an array
  const services = Array.isArray(servicesQuery?.data) ? servicesQuery?.data : [];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slogan: "",
    description: "",
    highlights: "",
    price: "",
    discountedPrice: "",
    isActive: true,
    imageUrl: "",
    icon: "",
  });

  const resetForm = () => {
    setForm({
      title: "",
      slogan: "",
      description: "",
      highlights: "",
      price: "",
      discountedPrice: "",
      isActive: true,
      imageUrl: "",
      icon: "",
    });
    setEditingId(null);
  };

  const startEdit = (service: any) => {
    setForm({
      title: service.title || "",
      slogan: service.slogan || "",
      description: service.description || "",
      highlights: (service.highlights || []).join("\n"),
      price: service.price?.toString() || "",
      discountedPrice: service.discountedPrice?.toString() || "",
      isActive: service.isActive ?? true,
      imageUrl: service.imageUrl || "",
      icon: service.icon || "",
    });
    setEditingId(service.id);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        slogan: form.slogan || undefined,
        description: form.description || undefined,
        highlights: form.highlights
          ? form.highlights.split("\n").filter((h) => h.trim())
          : undefined,
        price: parseFloat(form.price),
        discountedPrice: form.discountedPrice ? parseFloat(form.discountedPrice) : undefined,
        isActive: form.isActive,
        imageUrl: form.imageUrl || undefined,
        icon: form.icon || undefined,
      };

      if (editingId) {
        await updateService.mutateAsync({ id: editingId, ...payload });
        add({ title: "Service updated", kind: "success" });
      } else {
        await createService.mutateAsync(payload);
        add({ title: "Service created", kind: "success" });
      }
      resetForm();
    } catch (err: any) {
      add({
        title: editingId ? "Update failed" : "Create failed",
        description: err?.response?.data?.message || err?.message,
        kind: "error",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService.mutateAsync(id);
      add({ title: "Service deleted", kind: "success" });
    } catch (err: any) {
      add({ title: "Delete failed", description: err?.message, kind: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold">Services</h1>
          <p className="text-sm text-slate-400">Manage photography services</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Service Title *"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
              <Input
                placeholder="Slogan"
                value={form.slogan}
                onChange={(e) => setForm((f) => ({ ...f, slogan: e.target.value }))}
              />
              <div className="md:col-span-2">
                <textarea
                  placeholder="Description"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                  rows={3}
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Highlights (one per line)"
                  value={form.highlights}
                  onChange={(e) => setForm((f) => ({ ...f, highlights: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-slate-700"
                  rows={3}
                />
              </div>
              <Input
                type="number"
                step="0.01"
                placeholder="Price *"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Discounted Price"
                value={form.discountedPrice}
                onChange={(e) => setForm((f) => ({ ...f, discountedPrice: e.target.value }))}
              />
              <Input
                placeholder="Image URL"
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
              />
              <Input
                placeholder="Icon (emoji)"
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-900"
                />
                Active
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={createService.isPending || updateService.isPending}>
                {editingId ? "Update Service" : "Create Service"}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {servicesQuery.isLoading && <Skeleton className="h-64 w-full" />}

      {!servicesQuery.isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {service.icon && <span className="text-2xl">{service.icon}</span>}
                      <h3 className="font-semibold text-slate-50">{service.title}</h3>
                    </div>
                    {service.slogan && (
                      <p className="text-xs text-slate-400 italic mt-1">{service.slogan}</p>
                    )}
                    {service.description && (
                      <p className="text-sm text-slate-300 mt-2 line-clamp-2">{service.description}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Price:</span>
                        <span className="font-semibold text-slate-50">
                          ₹{service.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {service.discountedPrice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">Discounted:</span>
                          <span className="font-semibold text-green-400">
                            ₹{service.discountedPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Status:</span>
                        <span
                          className={service.isActive ? "text-green-400" : "text-red-400"}
                        >
                          {service.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => startEdit(service)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    loading={deleteService.isPending}
                  >
                    Delete
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

export default AdminServicesPage;

