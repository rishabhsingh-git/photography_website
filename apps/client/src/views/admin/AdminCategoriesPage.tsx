import React, { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Input } from "../../ui/primitives/Input";
import { Button } from "../../ui/primitives/Button";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const AdminCategoriesPage: React.FC = () => {
  const { categoriesQuery, createCategory, updateCategory } = useCategories();
  const { add } = useToastStore();
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  const [form, setForm] = useState({ name: "", slug: "", description: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory.mutateAsync(form);
      add({ title: "Category created", kind: "success" });
      setForm({ name: "", slug: "", description: "" });
    } catch (err: any) {
      add({ title: "Create failed", description: err?.message, kind: "error" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Categories</h1>
        <form className="flex flex-wrap gap-2 items-end" onSubmit={submit}>
          <Input
            placeholder="Name"
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
            required
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-52"
          />
          <Button type="submit" loading={createCategory.isPending}>
            Add
          </Button>
        </form>
      </div>

      {categoriesQuery.isLoading && <Skeleton className="h-64 w-full" />}

      {!categoriesQuery.isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cat.name}</p>
                    <p className="text-xs text-slate-400">{cat.slug}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      updateCategory.mutate({ id: cat.id, visible: !cat.visible })
                    }
                  >
                    {cat.visible ? "Hide" : "Show"}
                  </Button>
                </div>
                <p className="text-sm text-slate-300">{cat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;


