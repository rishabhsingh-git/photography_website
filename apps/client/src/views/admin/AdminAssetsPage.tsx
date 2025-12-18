import React, { useRef, useState } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useCategories } from "../../hooks/useCategories";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Button } from "../../ui/primitives/Button";
import { Select } from "../../ui/primitives/Select";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const AdminAssetsPage: React.FC = () => {
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const { categoriesQuery } = useCategories();
  const { assetsQuery, upload } = useAssets(categoryId);
  const { add } = useToastStore();
  // Ensure categories is always an array
  const categories = Array.isArray(categoriesQuery.data) ? categoriesQuery.data : [];
  // Ensure assets is always an array
  const assets = Array.isArray(assetsQuery.data) ? assetsQuery.data : [];
  const inputRef = useRef<HTMLInputElement | null>(null);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    if (categoryId) formData.append("categoryId", categoryId);
    try {
      await upload.mutateAsync(formData);
      add({ title: "Uploaded", kind: "success" });
    } catch (err: any) {
      add({ title: "Upload failed", description: err?.message, kind: "error" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Assets</h1>
        <div className="flex items-center gap-2">
          <Select
            value={categoryId ?? ""}
            onChange={(e) => setCategoryId(e.target.value || undefined)}
            className="w-52"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <input ref={inputRef} type="file" className="hidden" onChange={onUpload} />
          <Button onClick={() => inputRef.current?.click()} loading={upload.isPending}>
            Upload
          </Button>
        </div>
      </div>

      {assetsQuery.isLoading && <Skeleton className="h-64 w-full" />}

      {!assetsQuery.isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <img src={asset.url} alt={asset.title ?? "Asset"} className="h-40 w-full object-cover" />
              <CardContent className="text-xs text-slate-300">
                <p className="font-semibold text-sm text-slate-100 truncate">{asset.title ?? "Asset"}</p>
                <p className="truncate">{asset.tags?.join(", ")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAssetsPage;


