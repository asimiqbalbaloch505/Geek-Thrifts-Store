import { AdminLayout } from "@/components/admin-layout";
import {
  useListProducts,
  useListCategories,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getListProductsQueryKey,
  getListCategoriesQueryKey,
  Product,
  Category,
} from "@workspace/api-client-react";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2, Upload, Link as LinkIcon, Loader2, X } from "lucide-react";

type SizeInventoryItem = { size: string; qty: number };

const sizeInventoryItemSchema = z.object({
  size: z.string(),
  qty: z.coerce.number().min(0),
});

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  imageUrl: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one product image is required"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  sizes: z.array(z.string()),
  sizeInventory: z.array(sizeInventoryItemSchema),
  stock: z.coerce.number().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductValues = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Multi-image upload states
  const [uploadingSlots, setUploadingSlots] = useState<{ [key: number]: boolean }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [imageModes, setImageModes] = useState<{ [key: number]: "upload" | "url" }>({
    0: "upload",
    1: "upload",
    2: "upload",
    3: "upload",
    4: "upload",
  });

  const { data: products, isLoading } = useListProducts(undefined, {
    query: { queryKey: getListProductsQueryKey() },
  });

  const { data: categories } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() },
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      images: [],
      categoryId: 0,
      sizes: [],
      sizeInventory: [],
      stock: 0,
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const watchedSizeInventory = useWatch({ control: form.control, name: "sizeInventory" });
  const watchedImages = useWatch({ control: form.control, name: "images" }) || [];

  const getAvailableSizesForCategory = (catId: number, catList?: Category[]): string[] => {
    if (!catId || !catList) return [];
    const category = catList.find((c) => c.id === catId);
    if (!category) return [];

    if (category.sizes && category.sizes.length > 0) {
      return category.sizes;
    }

    if (category.parentId) {
      const parent = catList.find((p) => p.id === category.parentId);
      if (parent?.sizes && parent.sizes.length > 0) {
        return parent.sizes;
      }
    }

    return [];
  };

  const availableSizes = getAvailableSizesForCategory(Number(watchedCategoryId), categories);
  const hasSizes = availableSizes.length > 0;

  useEffect(() => {
    if (!hasSizes) {
      form.setValue("sizeInventory", []);
      form.setValue("sizes", []);
    }
  }, [watchedCategoryId, hasSizes, form]);

  const openAddDialog = () => {
    setEditingProduct(null);
    setUploadError(null);
    setActiveImageIndex(0);
    form.reset({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      images: [],
      categoryId: categories?.[0]?.id || 0,
      sizes: [],
      sizeInventory: [],
      stock: 0,
      isActive: true,
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product & { images?: string[] }) => {
    setEditingProduct(product);
    setUploadError(null);
    setActiveImageIndex(0);
    const inv = (product.sizeInventory ?? []) as SizeInventoryItem[];
    const productImages =
      product.images && product.images.length > 0
        ? product.images
        : product.imageUrl
        ? [product.imageUrl]
        : [];

    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      images: productImages,
      categoryId: product.categoryId,
      sizes: inv.map((s) => s.size),
      sizeInventory: inv,
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setIsDialogOpen(true);
  };

  // Upload image slot to Supabase
  // Upload image slot to Supabase
  const handleFileUploadForIndex = async (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingSlots((prev) => ({ ...prev, [index]: true }));
    setUploadError(null);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadErr) throw uploadErr;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(filePath);

      const currentImages = [...(form.getValues("images") || [])];
      currentImages[index] = publicUrl;
      form.setValue("images", currentImages.filter(Boolean), { shouldValidate: true });
      form.setValue("imageUrl", currentImages[0] || "");
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload image.");
    } finally {
      setUploadingSlots((prev) => ({ ...prev, [index]: false }));
    }
  };
  const removeImageAtIndex = (index: number) => {
    const currentImages = [...(form.getValues("images") || [])];
    currentImages.splice(index, 1);
    form.setValue("images", currentImages, { shouldValidate: true });
    form.setValue("imageUrl", currentImages[0] || "");
    if (activeImageIndex >= currentImages.length) {
      setActiveImageIndex(Math.max(0, currentImages.length - 1));
    }
  };

  const updateImageUrlAtIndex = (url: string, index: number) => {
    const currentImages = [...(form.getValues("images") || [])];
    currentImages[index] = url;
    form.setValue("images", currentImages, { shouldValidate: true });
    form.setValue("imageUrl", currentImages[0] || "");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
        }
      );
    }
  };

  const toggleSize = (size: string, checked: boolean) => {
    const current = form.getValues("sizeInventory") || [];
    const currentSizes = form.getValues("sizes") || [];

    if (checked) {
      form.setValue("sizeInventory", [...current, { size, qty: 1 }]);
      form.setValue("sizes", [...currentSizes, size]);
    } else {
      form.setValue("sizeInventory", current.filter((s) => s.size !== size));
      form.setValue("sizes", currentSizes.filter((s) => s !== size));
    }
  };

  const updateQty = (size: string, qty: number) => {
    const current = form.getValues("sizeInventory") || [];
    form.setValue(
      "sizeInventory",
      current.map((s) => (s.size === size ? { ...s, qty } : s))
    );
  };

  const onSubmit = (values: ProductValues) => {
    const finalStock = hasSizes
      ? values.sizeInventory.reduce((sum, s) => sum + s.qty, 0)
      : values.stock;
    const payload = {
      ...values,
      stock: finalStock,
      imageUrl: values.images[0] || values.imageUrl || "",
    };

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
          },
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            setIsDialogOpen(false);
          },
        }
      );
    }
  };

  const isAnyUploading = Object.values(uploadingSlots).some(Boolean);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Products</h1>
          <p className="text-muted-foreground text-sm">Manage inventory and catalog.</p>
        </div>
        <Button
          className="rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6 flex gap-2"
          onClick={openAddDialog}
        >
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">
            Loading...
          </div>
        ) : !products || products.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">
            No products found
          </div>
        ) : (
          products.map((product) => {
            const inv = (product.sizeInventory ?? []) as SizeInventoryItem[];
            const displaySizes =
              inv.length > 0
                ? inv.map((s) => `${s.size}(${s.qty})`).join(", ")
                : product.stock > 0
                ? `Qty: ${product.stock}`
                : "Out of Stock";
            return (
              <div key={product.id} className="border border-border bg-card flex flex-col group">
                <div className="aspect-[4/3] bg-muted border-b border-border relative">
                  {product.imageUrl ? (
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground font-bold tracking-widest">
                      No Image
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute top-2 left-2 bg-muted-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                      Draft
                    </div>
                  )}
                  {product.isFeatured && (
                    <div className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                      Featured
                    </div>
                  )}

                  {/* FIXED OVERLAY FOR MOBILE & DESKTOP */}
<div className="absolute inset-0 flex items-center justify-center gap-2 p-2 sm:bg-background/80 sm:backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
  <Button
    className="rounded-none h-9 w-9 sm:h-10 sm:w-10 bg-background/90 border-border shadow-md"
    onClick={() => openEditDialog(product)}
    size="icon"
    variant="outline"
  >
    <Edit className="w-4 h-4" />
  </Button>
  <Button
    className="rounded-none h-9 w-9 sm:h-10 sm:w-10 shadow-md"
    onClick={() => handleDelete(product.id)}
    size="icon"
    variant="destructive"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>
                </div>
                <div className="p-4 font-sans flex-1 flex flex-col">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                    {product.categoryName}
                  </div>
                  <div className="font-serif font-bold text-lg leading-tight mb-2 truncate">
                    {product.name}
                  </div>
                  <div className="font-bold text-sm mb-4">{formatPKR(product.price)}</div>
                  <div className="mt-auto text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="uppercase tracking-widest font-bold truncate">
                      {displaySizes}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl rounded-none border border-border p-0 gap-0 max-h-[90vh] overflow-y-auto bg-background">
          <div className="sticky top-0 bg-background z-10 border-b border-border p-6">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-bold uppercase tracking-tighter">
                {editingProduct ? "Edit Product" : "New Product"}
              </DialogTitle>
            </DialogHeader>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-8 font-sans">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">
                          Product Name
                        </FormLabel>
                        <FormControl>
                          <Input className="rounded-none border-border" {...field} />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold">
                            Price (PKR)
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none border-border"
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold">
                            Category
                          </FormLabel>
                          <Select
                            value={field.value ? field.value.toString() : ""}
                            onValueChange={(v) => field.onChange(Number(v))}
                          >
                            <FormControl>
                              <SelectTrigger className="rounded-none border-border">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-none">
                              {categories?.map((cat) => {
                                const parentCat = cat.parentId
                                  ? categories.find((p) => p.id === cat.parentId)
                                  : null;
                                const label = parentCat
                                  ? `${parentCat.name} / ${cat.name}`
                                  : cat.name;

                                return (
                                  <SelectItem key={cat.id} value={String(cat.id)}>
                                    {parentCat ? `— ${label}` : label}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  {hasSizes ? (
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold mb-2">
                        Sizes &amp; Stock
                      </p>
                      <p className="text-[10px] text-muted-foreground mb-3">
                        Check a size to add it. Set quantity for each selected size.
                      </p>
                      <div className="space-y-2">
                        {availableSizes.map((size) => {
                          const inv = watchedSizeInventory ?? [];
                          const item = inv.find((s) => s.size === size);
                          const isChecked = !!item;
                          return (
                            <div
                              key={size}
                              className="flex items-center gap-3 border border-border p-2.5"
                            >
                              <Checkbox
                                checked={isChecked}
                                className="rounded-none"
                                onCheckedChange={(checked) => toggleSize(size, !!checked)}
                              />
                              <span className="text-xs font-bold uppercase tracking-wider w-12 flex-shrink-0">
                                {size}
                              </span>
                              <div className="flex-1 flex items-center gap-2">
                                {isChecked ? (
                                  <>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={item?.qty ?? 0}
                                      onChange={(e) =>
                                        updateQty(size, Number(e.target.value))
                                      }
                                      className="h-7 w-20 rounded-none border-border text-xs"
                                      placeholder="Qty"
                                    />
                                    <span className="text-[10px] text-muted-foreground">
                                      units
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">
                                    Not available
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {watchedSizeInventory && watchedSizeInventory.length > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-2 font-bold">
                          Total stock: {watchedSizeInventory.reduce((s, i) => s + i.qty, 0)} units
                        </p>
                      )}
                    </div>
                  ) : (
                    <FormField
                      control={form.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold">
                            Stock Quantity
                          </FormLabel>
                          <FormControl>
                            <Input
                              className="rounded-none border-border"
                              min={0}
                              type="number"
                              {...field}
                            />
                          </FormControl>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            This category has no sizes. Enter total available quantity.
                          </p>
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Right Column - Multi-Image Manager */}
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold block mb-2">
                          Product Images ({watchedImages.length}/5)
                        </FormLabel>

                        {/* Image slot selector tabs */}
                        <div className="flex gap-1 mb-3">
                          {[0, 1, 2, 3, 4].map((idx) => {
                            const hasImg = Boolean(watchedImages[idx]);
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setActiveImageIndex(idx)}
                                className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                                  activeImageIndex === idx
                                    ? "border-foreground bg-foreground text-background"
                                    : hasImg
                                    ? "border-border bg-muted text-foreground"
                                    : "border-dashed border-border text-muted-foreground"
                                }`}
                              >
                                Image {idx + 1}
                              </button>
                            );
                          })}
                        </div>

                        {/* Upload or URL switcher for active index */}
                        <div className="flex gap-2 mb-3">
                          <Button
                            type="button"
                            variant={
                              imageModes[activeImageIndex] === "upload" ? "default" : "outline"
                            }
                            size="sm"
                            className="rounded-none text-[10px] uppercase tracking-widest h-8"
                            onClick={() =>
                              setImageModes((prev) => ({ ...prev, [activeImageIndex]: "upload" }))
                            }
                          >
                            <Upload className="w-3 h-3 mr-1" /> File Upload
                          </Button>
                          <Button
                            type="button"
                            variant={
                              imageModes[activeImageIndex] === "url" ? "default" : "outline"
                            }
                            size="sm"
                            className="rounded-none text-[10px] uppercase tracking-widest h-8"
                            onClick={() =>
                              setImageModes((prev) => ({ ...prev, [activeImageIndex]: "url" }))
                            }
                          >
                            <LinkIcon className="w-3 h-3 mr-1" /> External URL
                          </Button>
                        </div>

                        {/* Input control according to mode */}
                        {imageModes[activeImageIndex] === "upload" ? (
                          <div className="space-y-2">
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUploadForIndex(e, activeImageIndex)}
                                disabled={uploadingSlots[activeImageIndex]}
                                className="rounded-none border-border text-xs cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-none file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                              />
                            </FormControl>
                            {uploadingSlots[activeImageIndex] && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Loader2 className="w-3 h-3 animate-spin" /> Uploading image{" "}
                                {activeImageIndex + 1}...
                              </div>
                            )}
                          </div>
                        ) : (
                          <FormControl>
                            <Input
                              className="rounded-none border-border text-xs"
                              placeholder="https://..."
                              value={watchedImages[activeImageIndex] || ""}
                              onChange={(e) =>
                                updateImageUrlAtIndex(e.target.value, activeImageIndex)
                              }
                            />
                          </FormControl>
                        )}

                        {/* Thumbnail Grid Preview */}
                        <div className="grid grid-cols-5 gap-2 mt-4">
                          {[0, 1, 2, 3, 4].map((idx) => {
                            const img = watchedImages[idx];
                            return (
                              <div
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`aspect-square bg-muted border relative group cursor-pointer overflow-hidden ${
                                  activeImageIndex === idx
                                    ? "ring-2 ring-primary"
                                    : "border-border"
                                }`}
                              >
                                {img ? (
                                  <>
                                    <img
                                      src={getImageUrl(img)}
                                      alt={`Slot ${idx + 1}`}
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeImageAtIndex(idx);
                                      }}
                                      className="absolute top-0.5 right-0.5 bg-background/80 text-foreground p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground font-bold">
                                    +{idx + 1}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {uploadError && (
                          <p className="text-[10px] text-destructive font-bold mt-2">
                            {uploadError}
                          </p>
                        )}
                        <FormMessage className="text-[10px] mt-1" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            className="rounded-none border-border min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-6 pt-2">
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold cursor-pointer">
                            Active (Visible)
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-xs uppercase tracking-widest font-bold cursor-pointer">
                            Featured on Home
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-none uppercase font-bold text-xs tracking-widest"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createProduct.isPending || updateProduct.isPending || isAnyUploading
                  }
                  className="rounded-none uppercase font-bold text-xs tracking-widest px-8"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}