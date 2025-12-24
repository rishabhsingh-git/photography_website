import React, { useState } from "react";
import { useAdminServices } from "../../hooks/useAdminServices";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Input } from "../../ui/primitives/Input";
import { Button } from "../../ui/primitives/Button";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { Badge } from "../../ui/primitives/Badge";

const AdminServicesPage: React.FC = () => {
  const { servicesQuery, createService, updateService, deleteService } = useAdminServices();
  const { add } = useToastStore();
  const services = Array.isArray(servicesQuery?.data) ? servicesQuery.data : [];

  // Log for debugging and force refetch on mount
  React.useEffect(() => {
    console.log('🔍 [AdminServicesPage] Query State:', {
      isLoading: servicesQuery.isLoading,
      isFetching: servicesQuery.isFetching,
      isError: servicesQuery.isError,
      error: servicesQuery.error,
      data: servicesQuery.data,
      dataLength: Array.isArray(servicesQuery.data) ? servicesQuery.data.length : 0,
      status: servicesQuery.status,
      fetchStatus: servicesQuery.fetchStatus,
    });
    
    if (servicesQuery.isError) {
      console.error('❌ [AdminServicesPage] Services query error:', servicesQuery.error);
    }
    if (servicesQuery.data) {
      console.log('✅ [AdminServicesPage] Services loaded:', services.length);
    }
    
    // Force refetch on mount to ensure data is loaded
    if (!servicesQuery.isFetching && !servicesQuery.data) {
      console.log('🔄 [AdminServicesPage] Triggering refetch on mount...');
      servicesQuery.refetch().catch(err => {
        console.error('❌ [AdminServicesPage] Refetch error:', err);
      });
    }
  }, [servicesQuery.isError, servicesQuery.error, servicesQuery.data, services.length, servicesQuery.isLoading, servicesQuery.isFetching, servicesQuery.status, servicesQuery.fetchStatus]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
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
    setShowForm(false);
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
    setShowForm(true);
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
          <h1 className="text-2xl font-semibold text-slate-50">Services</h1>
          <p className="text-slate-400 text-sm mt-1">Manage photography services</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Create Service</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="font-semibold">
            {editingId ? "Edit Service" : "Create New Service"}
          </CardHeader>
          <CardContent>
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
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {servicesQuery.isLoading && (
            <div className="p-6">
              <Skeleton className="h-64 w-full" />
              <p className="text-center text-slate-400 text-sm mt-4">Loading services...</p>
            </div>
          )}
          {servicesQuery.isError && (
            <div className="text-center py-10">
              <p className="text-red-400 font-semibold">Error loading services</p>
              <p className="text-slate-500 text-sm mt-2">
                {(servicesQuery.error as any)?.response?.data?.message || 
                 (servicesQuery.error as any)?.message || 
                 "Unknown error. Please check your connection and try again."}
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-4"
                onClick={() => servicesQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          )}
          {!servicesQuery.isLoading && !servicesQuery.isError && services.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 text-lg">No services found</p>
              <p className="text-slate-500 text-sm mt-2">Create your first service to get started!</p>
            </div>
          )}
          {!servicesQuery.isLoading && !servicesQuery.isError && services.length > 0 && (
            <Table>
              <THead>
                <TR>
                  <TH>Icon</TH>
                  <TH>Title</TH>
                  <TH>Slogan</TH>
                  <TH>Price</TH>
                  <TH>Discounted</TH>
                  <TH>Status</TH>
                  <TH>Created</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {services.map((service) => (
                  <TR key={service.id} className="hover:bg-slate-800/50">
                    <TD>{service.icon || "—"}</TD>
                    <TD className="font-semibold">{service.title}</TD>
                    <TD className="text-slate-400 text-sm">{service.slogan || "—"}</TD>
                    <TD className="font-semibold">₹{service.price?.toLocaleString("en-IN")}</TD>
                    <TD className="text-green-400">
                      {service.discountedPrice ? `₹${service.discountedPrice.toLocaleString("en-IN")}` : "—"}
                    </TD>
                    <TD>
                      <Badge variant={service.isActive ? "success" : "danger"}>
                        {service.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TD>
                    <TD className="text-slate-400 text-sm">
                      {service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "—"}
                    </TD>
                    <TD>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
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
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminServicesPage;
