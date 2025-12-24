import React, { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Input } from "../../ui/primitives/Input";
import { Button } from "../../ui/primitives/Button";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { Badge } from "../../ui/primitives/Badge";

const AdminCategoriesPage: React.FC = () => {
  const { categoriesQuery, createCategory, updateCategory, deleteCategory } = useCategories();
  const { add } = useToastStore();
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [showForm, setShowForm] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync(form);
      add({ title: "Category created", kind: "success" });
      setForm({ name: "", slug: "", description: "" });
      setShowForm(false);
    } catch (err: any) {
      add({ title: "Create failed", description: err?.message, kind: "error" });
    }
  };

  const handleToggleVisibility = async (cat: any) => {
    try {
      await updateCategory.mutateAsync({ id: cat.id, visible: !cat.visible });
      add({ title: "Category updated", kind: "success" });
    } catch (err: any) {
      add({ title: "Update failed", description: err?.message, kind: "error" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory.mutateAsync(id);
      add({ title: "Category deleted", kind: "success" });
    } catch (err: any) {
      add({ title: "Delete failed", description: err?.message, kind: "error" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Categories</h1>
          <p className="text-slate-400 text-sm mt-1">Manage photo categories</p>
        </div>
        <Button onClick={() => setShowForm(true)}>+ Create Category</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader className="font-semibold">Create New Category</CardHeader>
          <CardContent>
            <form className="flex flex-wrap gap-2 items-end" onSubmit={submit}>
              <Input
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-40"
                required
              />
              <Input
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-32"
              />
              <Input
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-52"
              />
              <Button type="submit" loading={createCategory.isPending}>
                Create
              </Button>
              <Button type="button" variant="secondary" onClick={() => {
                setShowForm(false);
                setForm({ name: "", slug: "", description: "" });
              }}>
                Cancel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {categoriesQuery.isLoading && <Skeleton className="h-64 w-full" />}
          {!categoriesQuery.isLoading && categories.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400">No categories found. Create your first category!</p>
            </div>
          )}
          {!categoriesQuery.isLoading && categories.length > 0 && (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Slug</TH>
                  <TH>Description</TH>
                  <TH>Status</TH>
                  <TH>Created</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {categories.map((cat) => (
                  <TR key={cat.id} className="hover:bg-slate-800/50">
                    <TD className="font-semibold">{cat.name}</TD>
                    <TD className="text-slate-400 text-sm font-mono">{cat.slug}</TD>
                    <TD className="text-slate-300 text-sm">{cat.description || "—"}</TD>
                    <TD>
                      <Badge variant={cat.visible !== false ? "success" : "muted"}>
                        {cat.visible !== false ? "Visible" : "Hidden"}
                      </Badge>
                    </TD>
                    <TD className="text-slate-400 text-sm">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : "—"}
                    </TD>
                    <TD>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleVisibility(cat)}
                          loading={updateCategory.isPending}
                        >
                          {cat.visible !== false ? "Hide" : "Show"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(cat.id)}
                          loading={deleteCategory.isPending}
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

export default AdminCategoriesPage;
