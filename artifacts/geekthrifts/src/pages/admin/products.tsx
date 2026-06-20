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
} from "@workspace/api-client-react";
import { formatPKR, getImageUrl } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Edit, Plus, Trash2, Upload, X, Loader2 } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  sizes: z.array(z.string()),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductValues = z.infer<typeof productSchema>;

const SIZES_BY_SLUG: Record<string, string[]> = {
  shirts:   ["XS", "S", "M", "L", "XL", "XXL"],
  ties:     ["Short / Slim", "Short / Regular", "Long / Slim", "Long / Regular"],
  shoes:    ["UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12"],
  watches:  [],
  belts:    ['30"', '32"', '34"', '36"', '38"', '40"', '42"', '44"'],
  trousers: ["28", "30", "32", "34", "36", "38", "40"],
};

const NO_SIZE_SLUGS = new Set(["watches"]);

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      name: "", description: "", price: 0, imageUrl: "",
      categoryId: 0, sizes: [], stock: 1, isActive: true, isFeatured: false,
    },
  });

  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const selectedCategory = categories?.find(c => c.id === Number(watchedCategoryId));
  const categorySlug = selectedCategory?.slug ?? "";
  const availableSizes = SIZES_BY_SLUG[categorySlug] ?? ["S", "M", "L", "XL", "XXL"];
  const isNoSize = NO_SIZE_SLUGS.has(categorySlug);

  useEffect(() => {
    if (isNoSize) {
      form.setValue("sizes", []);
    }
  }, [isNoSize, form]);

  const uploadImage = async (file: File) => {
    if (!categorySlug) {
      alert("Please select a category first");
      return;
    }
    setIsUploading(true);
    try {
      const adminToken = localStorage.getItem("adminToken") ?? "";
      const formData = new FormData();
      formData.append("file", file);
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const res = await fetch(`${base}/api/upload?category=${categorySlug}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json() as { imageUrl: string };
      form.setValue("imageUrl", data.imageUrl);
      setImagePreview(data.imageUrl);
    } catch {
      alert("Image upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const openAddDialog = () => {
    setEditingProduct(null);
    setImagePreview("");
    form.reset({
      name: "", description: "", price: 0, imageUrl: "",
      categoryId: categories?.[0]?.id || 0,
      sizes: [], stock: 1, isActive: true, isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl || "");
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
      sizes: product.sizes || [],
      stock: product.stock,
      isActive: product.isActive,
      isFeatured: product.isFeatured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }),
      });
    }
  };

  const onSubmit = (values: ProductValues) => {
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
        },
      });
    } else {
      createProduct.mutate({ data: values }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
        },
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Products</h1>
          <p className="text-muted-foreground text-sm">Manage inventory and catalog.</p>
        </div>
        <Button onClick={openAddDialog} className="rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6 flex gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">Loading...</div>
        ) : !products || products.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">No products found</div>
        ) : (
          products.map(product => (
            <div key={product.id} className="border border-border bg-card flex flex-col group">
              <div className="aspect-[4/3] bg-muted border-b border-border relative">
                {product.imageUrl ? (
                  <img src={getImageUrl(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground font-bold tracking-widest">No Image</div>
                )}
                {!product.isActive && (
                  <div className="absolute top-2 left-2 bg-muted-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1">Draft</div>
                )}
                {product.isFeatured && (
                  <div className="absolute top-2 right-2 bg-foreground text-background text-[10px] font-bold uppercase tracking-widest px-2 py-1">Featured</div>
                )}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                  <Button variant="outline" size="icon" className="rounded-none h-10 w-10 bg-background border-border" onClick={() => openEditDialog(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" size="icon" className="rounded-none h-10 w-10" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 font-sans flex-1 flex flex-col">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{product.categoryName}</div>
                <div className="font-serif font-bold text-lg leading-tight mb-2 truncate">{product.name}</div>
                <div className="font-bold text-sm mb-4">{formatPKR(product.price)}</div>
                <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground border-t border-border pt-4">
                  <div className="uppercase tracking-widest font-bold">Stock: {product.stock}</div>
                  <div className="uppercase tracking-widest font-bold">
                    {product.sizes?.length ? product.sizes.join(", ") : "One Size"}
                  </div>
                </div>
              </div>
            </div>
          ))
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
                {/* Left column */}
                <div className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Product Name</FormLabel>
                      <FormControl><Input className="rounded-none border-border" {...field} /></FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Price (PKR)</FormLabel>
                        <FormControl><Input type="number" className="rounded-none border-border" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Stock</FormLabel>
                        <FormControl><Input type="number" className="rounded-none border-border" {...field} /></FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="categoryId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Category</FormLabel>
                      <Select value={field.value.toString()} onValueChange={v => field.onChange(Number(v))}>
                        <FormControl>
                          <SelectTrigger className="rounded-none border-border">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-none border-border">
                          {categories?.map(c => (
                            <SelectItem key={c.id} value={c.id.toString()} className="rounded-none uppercase text-xs tracking-wider font-bold">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />

                  {/* Sizes — hidden for no-size categories */}
                  {!isNoSize && availableSizes.length > 0 && (
                    <FormField control={form.control} name="sizes" render={() => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">
                          Available Sizes
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {availableSizes.map(size => (
                            <FormField key={size} control={form.control} name="sizes" render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-2 space-y-0 border border-border p-2">
                                <FormControl>
                                  <Checkbox
                                    className="rounded-none"
                                    checked={field.value?.includes(size)}
                                    onCheckedChange={checked =>
                                      checked
                                        ? field.onChange([...field.value, size])
                                        : field.onChange(field.value?.filter(v => v !== size))
                                    }
                                  />
                                </FormControl>
                                <FormLabel className="font-bold text-xs cursor-pointer">{size}</FormLabel>
                              </FormItem>
                            )} />
                          ))}
                        </div>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  )}

                  {isNoSize && (
                    <div className="border border-border p-3 bg-muted/30">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Sizes</p>
                      <p className="text-xs text-muted-foreground mt-1">No size selection required for this category — listed as One Size.</p>
                    </div>
                  )}
                </div>

                {/* Right column — image upload */}
                <div className="space-y-4">
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Product Image</FormLabel>

                      {/* Preview */}
                      {(imagePreview || field.value) ? (
                        <div className="relative aspect-[4/3] bg-muted border border-border overflow-hidden group/img">
                          <img
                            src={getImageUrl(imagePreview || field.value)}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-white text-black text-[10px] uppercase tracking-widest font-bold px-3 py-2 hover:bg-gray-100"
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={() => { field.onChange(""); setImagePreview(""); }}
                              className="bg-white text-black p-2 hover:bg-gray-100"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (!categorySlug) { alert("Select a category first"); return; }
                            fileInputRef.current?.click();
                          }}
                          className="w-full aspect-[4/3] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 hover:border-gray-400 hover:bg-muted/30 transition-colors"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                              <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground" />
                              <div className="text-center">
                                <p className="text-[11px] uppercase tracking-widest font-bold text-muted-foreground">Click to upload image</p>
                                <p className="text-[10px] text-muted-foreground mt-1">JPG, PNG, WebP — max 10MB</p>
                              </div>
                            </>
                          )}
                        </button>
                      )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) uploadImage(file);
                          e.target.value = "";
                        }}
                      />

                      {isUploading && (imagePreview || field.value) && (
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Uploading new image...
                        </div>
                      )}
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )} />
                </div>
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none min-h-[100px] rounded-none border-border" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              <div className="flex gap-8 border-t border-border pt-6 pb-6">
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold cursor-pointer">Active (Visible)</FormLabel>
                  </FormItem>
                )} />
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold cursor-pointer">Featured on Home</FormLabel>
                  </FormItem>
                )} />
              </div>

              <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t border-border flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none font-bold uppercase text-xs tracking-widest">
                  Cancel
                </Button>
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending || isUploading} className="rounded-none font-bold uppercase text-xs tracking-widest px-8">
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
