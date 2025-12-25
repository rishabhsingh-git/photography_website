import React, { useRef, useState, useEffect } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useAdminServices } from "../../hooks/useAdminServices";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Button } from "../../ui/primitives/Button";
import { Select } from "../../ui/primitives/Select";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { Badge } from "../../ui/primitives/Badge";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "../../ui/primitives/Tabs";

const AdminAssetsPage: React.FC = () => {
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const { servicesQuery } = useAdminServices();
  // Get all services (active and inactive) for admin
  const allServices = Array.isArray(servicesQuery?.data) ? servicesQuery.data : [];
  const activeServices = allServices.filter(s => s.isActive);
  // Determine which service is active based on tab index (0 = all, 1+ = service index)
  const activeServiceId = activeTabIndex > 0 ? activeServices[activeTabIndex - 1]?.id : undefined;
  // Fetch all assets for "All Assets" tab, filter by service only when viewing specific service tab
  const { assetsQuery, upload, uploadMultiple, deleteAsset } = useAssets(undefined, activeServiceId);
  const { add } = useToastStore();
  const services = allServices;
  const assets = Array.isArray(assetsQuery.data) ? assetsQuery.data : [];

  // Debug logging for assets
  useEffect(() => {
    console.log('📊 [AdminAssetsPage] Assets Query State:', {
      isLoading: assetsQuery.isLoading,
      isFetching: assetsQuery.isFetching,
      isError: assetsQuery.isError,
      error: assetsQuery.error,
      dataLength: assets.length,
      activeServiceId,
      activeTabIndex,
      sampleAssets: assets.slice(0, 3).map((a: any) => ({
        id: a.id,
        title: a.title,
        serviceId: a.serviceId,
        serviceTitle: a.service?.title,
      })),
    });
  }, [assetsQuery.isLoading, assetsQuery.isFetching, assetsQuery.data, assets.length, activeServiceId, activeTabIndex]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Log services query state and force refetch if needed
  useEffect(() => {
    console.log('🔍 [AdminAssetsPage] Services Query State:', {
      isLoading: servicesQuery.isLoading,
      isFetching: servicesQuery.isFetching,
      isError: servicesQuery.isError,
      error: servicesQuery.error,
      data: servicesQuery.data,
      dataLength: allServices.length,
      activeServicesCount: activeServices.length,
    });
    
    // Force refetch on mount to ensure services are loaded
    if (!servicesQuery.isFetching && allServices.length === 0 && !servicesQuery.isError) {
      console.log('🔄 [AdminAssetsPage] Triggering services refetch on mount...');
      servicesQuery.refetch().catch(err => {
        console.error('❌ [AdminAssetsPage] Services refetch error:', err);
      });
    }
  }, [servicesQuery.isLoading, servicesQuery.isFetching, servicesQuery.isError, servicesQuery.data, allServices.length, activeServices.length]);

  // Auto-select first service if none selected and services are available
  useEffect(() => {
    if (!selectedService && activeServices.length > 0) {
      console.log('🎯 [AdminAssetsPage] Auto-selecting first service:', activeServices[0].id);
      setSelectedService(activeServices[0].id);
    }
  }, [selectedService, activeServices]);

  // Group assets by service (for "All Assets" tab)
  // When viewing "All Assets" tab, we need to fetch ALL assets (not filtered by service)
  // So we need a separate query for all assets
  const { assetsQuery: allAssetsQuery } = useAssets(undefined, undefined);
  
  // Force refetch all assets when component mounts or when tab changes to "All Assets"
  useEffect(() => {
    console.log('🔄 [AdminAssetsPage] Tab changed or component mounted, activeTabIndex:', activeTabIndex);
    if (activeTabIndex === 0) {
      console.log('🔄 [AdminAssetsPage] Refetching all assets for "All Assets" tab...');
      allAssetsQuery.refetch().catch(err => {
        console.error('❌ [AdminAssetsPage] All assets refetch error:', err);
      });
    } else if (activeServiceId) {
      console.log('🔄 [AdminAssetsPage] Refetching assets for service:', activeServiceId);
      assetsQuery.refetch().catch(err => {
        console.error('❌ [AdminAssetsPage] Service assets refetch error:', err);
      });
    }
  }, [activeTabIndex, activeServiceId]);

  // Force refetch on initial mount
  useEffect(() => {
    console.log('🚀 [AdminAssetsPage] Component mounted, forcing initial refetch...');
    allAssetsQuery.refetch().catch(err => {
      console.error('❌ [AdminAssetsPage] Initial all assets refetch error:', err);
    });
    assetsQuery.refetch().catch(err => {
      console.error('❌ [AdminAssetsPage] Initial service assets refetch error:', err);
    });
  }, []); // Only run on mount

  const allAssets = activeTabIndex === 0 
    ? (Array.isArray(allAssetsQuery.data) ? allAssetsQuery.data : [])
    : assets;

  const assetsByService = services.reduce((acc, service) => {
    const serviceAssets = allAssets.filter((asset: any) => {
      const matches = asset.serviceId === service.id;
      return matches;
    });
    acc[service.id] = {
      service,
      assets: serviceAssets,
    };
    return acc;
  }, {} as Record<string, { service: any; assets: any[] }>);

  // Debug logging for grouping
  useEffect(() => {
    console.log('📦 [AdminAssetsPage] Assets state:', {
      activeTabIndex,
      allAssetsCount: allAssets.length,
      assetsCount: assets.length,
      allAssetsQueryState: {
        isLoading: allAssetsQuery.isLoading,
        isFetching: allAssetsQuery.isFetching,
        isError: allAssetsQuery.isError,
        error: allAssetsQuery.error,
        dataLength: Array.isArray(allAssetsQuery.data) ? allAssetsQuery.data.length : 0,
      },
      assetsQueryState: {
        isLoading: assetsQuery.isLoading,
        isFetching: assetsQuery.isFetching,
        isError: assetsQuery.isError,
        error: assetsQuery.error,
        dataLength: assets.length,
      },
      servicesWithAssets: Object.keys(assetsByService).filter(id => assetsByService[id].assets.length > 0),
      counts: Object.entries(assetsByService).map(([id, data]) => ({
        serviceId: id,
        serviceTitle: data.service.title,
        count: data.assets.length,
      })),
    });
  }, [allAssets.length, assets.length, assetsByService, activeTabIndex, allAssetsQuery.isLoading, allAssetsQuery.isFetching, assetsQuery.isLoading, assetsQuery.isFetching]);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!selectedService) {
      add({ title: "Please select a service first", kind: "error" });
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    // Use multiple file upload endpoint if multiple files
    if (files.length > 1) {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      if (selectedService) formData.append("serviceId", selectedService);
      
      try {
        const result = await uploadMultiple.mutateAsync(formData);
        console.log('✅ [AdminAssetsPage] Upload result:', result);
        add({ title: `Uploaded ${files.length} file(s) to service`, kind: "success" });
        // Invalidate all asset queries to refresh the display
        assetsQuery.refetch();
        allAssetsQuery.refetch();
        // Also invalidate portfolio queries
        setTimeout(() => {
          assetsQuery.refetch();
          allAssetsQuery.refetch();
        }, 500);
      } catch (err: any) {
        console.error('❌ [AdminAssetsPage] Upload error:', err);
        add({ title: "Upload failed", description: err?.message, kind: "error" });
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
      return;
    }

    // Single file upload
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", file.name);
      if (selectedService) {
        formData.append("serviceId", selectedService);
        console.log('📤 [AdminAssetsPage] Uploading with serviceId:', selectedService);
      }
      return upload.mutateAsync(formData);
    });

    try {
      const results = await Promise.all(uploadPromises);
      console.log('✅ [AdminAssetsPage] Upload results:', results);
      add({ title: `Uploaded ${files.length} file(s) to service`, kind: "success" });
      // Invalidate all asset queries to refresh the display
      assetsQuery.refetch();
      allAssetsQuery.refetch();
      setTimeout(() => {
        assetsQuery.refetch();
        allAssetsQuery.refetch();
      }, 500);
    } catch (err: any) {
      console.error('❌ [AdminAssetsPage] Upload error:', err);
      add({ title: "Upload failed", description: err?.message, kind: "error" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const isVideoFile = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url) || url.includes('video');
  };

  const allAssetsCount = allAssets.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Assets</h1>
          <p className="text-slate-400 text-sm mt-1">Upload and manage photos by service</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-64">
            <Select
              value={selectedService ?? ""}
              onChange={(e) => setSelectedService(e.target.value || undefined)}
              className="w-full"
              disabled={servicesQuery.isLoading}
            >
              <option value="">
                {servicesQuery.isLoading ? "Loading services..." : "Select Service (Required)"}
              </option>
              {allServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.icon} {service.title} {service.isActive ? "" : "(Inactive)"}
                </option>
              ))}
            </Select>
            {servicesQuery.isError && (
              <p className="text-xs text-red-400 mt-1">
                Error loading services. Please refresh.
              </p>
            )}
            {!servicesQuery.isLoading && !servicesQuery.isError && allServices.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">
                No services found. Create a service first.
              </p>
            )}
          </div>
          <input 
            ref={inputRef} 
            type="file" 
            className="hidden" 
            onChange={onUpload} 
            accept="image/*,video/*" 
            multiple
          />
          <Button 
            onClick={() => {
              if (!selectedService) {
                add({ title: "Please select a service first", kind: "error" });
                return;
              }
              inputRef.current?.click();
            }} 
            loading={upload.isPending || uploadMultiple.isPending}
            disabled={!selectedService}
          >
            Upload Assets
          </Button>
        </div>
      </div>

      {/* Service-based Tabs View */}
      <Card>
        <CardContent className="p-0">
          {assetsQuery.isLoading && <Skeleton className="h-64 w-full" />}
          {!assetsQuery.isLoading && (
            <Tabs value={activeTabIndex} onChange={setActiveTabIndex}>
              <TabList className="border-b border-slate-800 px-4 overflow-x-auto">
                <Tab>
                  All Assets ({allAssetsCount})
                </Tab>
                {activeServices.map((service) => {
                  // Always use assetsByService for accurate count (calculated from allAssets)
                  // This shows the total count for each service regardless of which tab is active
                  const serviceAssetsCount = assetsByService[service.id]?.assets?.length || 0;
                  return (
                    <Tab key={service.id}>
                      <div className="flex items-center gap-2">
                        {service.icon && <span className="text-lg">{service.icon}</span>}
                        <span>{service.title}</span>
                        <Badge variant="muted" className="text-xs">
                          {serviceAssetsCount}
                        </Badge>
                      </div>
                    </Tab>
                  );
                })}
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className="p-4 md:p-6">
                    {allAssets.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📸</div>
                        <p className="text-slate-400 text-lg">No assets found</p>
                        <p className="text-slate-500 text-sm mt-2">Select a service and upload your first asset!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                        {allAssets.map((asset) => (
                          <Card key={asset.id} className="overflow-hidden group hover:border-slate-700 transition-colors">
                            <div className="relative aspect-square overflow-hidden bg-slate-900">
                              {isVideoFile(asset.url) ? (
                                <video
                                  src={asset.url}
                                  className="h-full w-full object-cover"
                                  controls
                                  muted
                                />
                              ) : (
                                <img 
                                  src={asset.url} 
                                  alt={asset.title ?? "Asset"} 
                                  className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  loading="lazy"
                                />
                              )}
                              {asset.service && (
                                <div className="absolute top-2 left-2">
                                  <Badge variant="default" className="text-xs">
                                    {asset.service.icon} {asset.service.title}
                                  </Badge>
                                </div>
                              )}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to delete "${asset.title ?? "this asset"}"? This will remove it from Oracle storage and the database.`)) {
                                      deleteAsset.mutate(asset.id, {
                                        onSuccess: () => {
                                          add({ title: "Asset deleted successfully", kind: "success" });
                                        },
                                        onError: (error: any) => {
                                          add({ title: `Failed to delete asset: ${error.message || "Unknown error"}`, kind: "error" });
                                        },
                                      });
                                    }
                                  }}
                                  loading={deleteAsset.isPending}
                                  className="h-8 w-8 p-0"
                                >
                                  🗑️
                                </Button>
                              </div>
                            </div>
                            <CardContent className="p-2 md:p-3">
                              <p className="font-medium text-xs md:text-sm text-slate-100 truncate">
                                {asset.title ?? "Untitled"}
                              </p>
                              {asset.service && (
                                <p className="text-xs text-slate-500 truncate mt-1">
                                  {asset.service.title}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </TabPanel>
                {activeServices.map((service) => {
                  // When viewing this service tab, assets are already filtered by serviceId via useAssets hook
                  // When viewing "All Assets" tab, we use grouped assets
                  const serviceAssets = activeTabIndex === 0 
                    ? (assetsByService[service.id]?.assets || [])
                    : (activeServiceId === service.id ? assets : []); // Only show assets for the active service tab
                  
                  return (
                    <TabPanel key={service.id}>
                      <div className="p-4 md:p-6">
                        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              {service.icon && <span className="text-3xl">{service.icon}</span>}
                              <div>
                                <h3 className="text-xl font-semibold text-slate-50">{service.title}</h3>
                                <p className="text-sm text-slate-400">{serviceAssets.length} assets</p>
                              </div>
                            </div>
                            {service.description && (
                              <p className="text-sm text-slate-500 mt-2 max-w-2xl">{service.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedService(service.id);
                                setTimeout(() => inputRef.current?.click(), 100);
                              }} 
                              loading={upload.isPending || uploadMultiple.isPending}
                            >
                              Upload to {service.title}
                            </Button>
                          </div>
                        </div>
                        {serviceAssets.length === 0 ? (
                          <div className="text-center py-16 border-2 border-dashed border-slate-800 rounded-xl">
                            <div className="text-5xl mb-4">📷</div>
                            <p className="text-slate-400">No assets for this service yet</p>
                            <p className="text-slate-500 text-sm mt-2">Click "Upload" to add photos</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                            {serviceAssets.map((asset) => (
                              <Card key={asset.id} className="overflow-hidden group hover:border-slate-700 transition-all cursor-pointer">
                                <div className="relative aspect-square overflow-hidden bg-slate-900">
                                  {isVideoFile(asset.url) ? (
                                    <video
                                      src={asset.url}
                                      className="h-full w-full object-cover"
                                      controls
                                      muted
                                    />
                                  ) : (
                                    <img 
                                      src={asset.url} 
                                      alt={asset.title ?? "Asset"} 
                                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      loading="lazy"
                                    />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="danger"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`Are you sure you want to delete "${asset.title ?? "this asset"}"? This will remove it from Oracle storage and the database.`)) {
                                          deleteAsset.mutate(asset.id, {
                                            onSuccess: () => {
                                              add({ title: "Asset deleted successfully", kind: "success" });
                                            },
                                            onError: (error: any) => {
                                              add({ title: `Failed to delete asset: ${error.message || "Unknown error"}`, kind: "error" });
                                            },
                                          });
                                        }
                                      }}
                                      loading={deleteAsset.isPending}
                                      className="h-8 w-8 p-0"
                                    >
                                      🗑️
                                    </Button>
                                  </div>
                                </div>
                                <CardContent className="p-2 md:p-3">
                                  <p className="font-medium text-xs md:text-sm text-slate-100 truncate">
                                    {asset.title ?? "Untitled"}
                                  </p>
                                  {asset.tags && asset.tags.length > 0 && (
                                    <p className="text-xs text-slate-500 truncate mt-1">
                                      {asset.tags.slice(0, 2).join(", ")}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabPanel>
                  );
                })}
              </TabPanels>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssetsPage;
