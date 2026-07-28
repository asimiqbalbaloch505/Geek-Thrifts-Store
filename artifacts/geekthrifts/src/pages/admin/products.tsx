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
import { useState, useEffect } from "react";
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
import { Edit, Plus, Trash2 } from "lucide-react";

type SizeInventoryItem = { size: string; qty: number };

const sizeInventoryItemSchema = z.object({ size: z.string(), qty: z.coerce.number().min(0) });

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price must be greater than 0"),
  imageUrl: z.string().optional(),
  categoryId: z.coerce.number().min(1, "Category is required"),
  sizes: z.array(z.string()),
  sizeInventory: z.array(sizeInventoryItemSchema),
  stock: z.coerce.number().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});

type ProductValues = z.infer<typeof productSchema>;

// Categories that have NO size selection at all
const NO_SIZE_SLUGS = new Set(["watches", "belts"]);

// Size options per category slug
const SIZE_OPTIONS: Record<string, string[]> = {
  shirts:   ["S", "M", "L", "XL"],
  trousers: ["S", "M", "L", "XL"],
  ties:     [],  // ties have no sizes — just stock qty
  shoes:    ["6", "7", "8", "9", "10", "11", "12"],
  watches:  [],
  belts:    [],
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

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
      categoryId: 0, sizes: [], sizeInventory: [], stock: 0,
      isActive: true, isFeatured: false,
    },
  });

  const watchedCategoryId = useWatch({ control: form.control, name: "categoryId" });
  const watchedSizeInventory = useWatch({ control: form.control, name: "sizeInventory" });
  const selectedCategory = categories?.find(c => c.id === Number(watchedCategoryId));
  const categorySlug = selectedCategory?.slug ?? "";
  const isNoSize = NO_SIZE_SLUGS.has(categorySlug);
  const getAvailableSizes = (category: typeof selectedCategory) => {
  if (!category) return [];
  const slug = category.slug;

  if (SIZE_OPTIONS[slug]) return SIZE_OPTIONS[slug];
  
  // Fallback to parent sizing for subcategories
  if (slug.includes("shirt")) return SIZE_OPTIONS["shirts"];
  if (slug.includes("trouser") || slug.includes("pant")) return SIZE_OPTIONS["trousers"];
  if (slug.includes("shoe")) return SIZE_OPTIONS["shoes"];

  return [];
};

const availableSizes = getAvailableSizes(selectedCategory);
  const hasSizes = !isNoSize && availableSizes.length > 0;
  const isTie = categorySlug === "ties";

  // When category changes, reset sizeInventory
  useEffect(() => {
    const newSizes = SIZE_OPTIONS[categorySlug] ?? [];
    if (isNoSize || newSizes.length === 0) {
      form.setValue("sizeInventory", []);
      form.setValue("sizes", []);
    }
  }, [categorySlug, isNoSize, form]);

  const openAddDialog = () => {
    setEditingProduct(null);
    setImagePreview("");
    form.reset({
      name: "", description: "", price: 0, imageUrl: "",
      categoryId: categories?.[0]?.id || 0,
      sizes: [], sizeInventory: [], stock: 0, isActive: true, isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.imageUrl || "");
    const inv = (product.sizeInventory ?? []) as SizeInventoryItem[];
    form.reset({
      name: product.name,
      description: product.description || "",
      price: product.price,
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId,
      sizes: inv.map(s => s.size),
      sizeInventory: inv,
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

  const toggleSize = (size: string, checked: boolean) => {
    const current = form.getValues("sizeInventory");
    if (checked) {
      form.setValue("sizeInventory", [...current, { size, qty: 1 }]);
      form.setValue("sizes", [...form.getValues("sizes"), size]);
    } else {
      form.setValue("sizeInventory", current.filter(s => s.size !== size));
      form.setValue("sizes", form.getValues("sizes").filter(s => s !== size));
    }
  };

  const updateQty = (size: string, qty: number) => {
    const current = form.getValues("sizeInventory");
    form.setValue("sizeInventory", current.map(s => s.size === size ? { ...s, qty } : s));
  };

  const onSubmit = (values: ProductValues) => {
    // For no-size/tie categories, derive stock from the field; for sized, it's sum of qty
    const finalStock = hasSizes
      ? values.sizeInventory.reduce((sum, s) => sum + s.qty, 0)
      : values.stock;
    const payload = { ...values, stock: finalStock };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, data: payload }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsDialogOpen(false);
        },
      });
    } else {
      createProduct.mutate({ data: payload }, {
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
          products.map(product => {
            const inv = (product.sizeInventory ?? []) as SizeInventoryItem[];
            const displaySizes = inv.length > 0
              ? inv.map(s => `${s.size}(${s.qty})`).join(", ")
              : product.stock > 0 ? `Qty: ${product.stock}` : "Out of Stock";
            return (
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
                  <div className="mt-auto text-xs text-muted-foreground border-t border-border pt-4">
                    <div className="uppercase tracking-widest font-bold truncate">{displaySizes}</div>
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
                {/* Left column */}
                <div className="space-y-5">
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

                    <FormField control={form.control} name="categoryId" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Category</FormLabel>
                        <Select value={field.value.toString()} onValueChange={v => field.onChange(Number(v))}>
                          <FormControl>
                            <SelectTrigger className="rounded-none border-border">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                         <SelectContent className="rounded-none border-border">
  {categories?.map(c => {
    const isSubcategory = c.parentId !== null;
    return (
      <SelectItem 
        key={c.id} 
        value={c.id.toString()} 
        className="rounded-none uppercase text-xs tracking-wider font-bold"
      >
        {isSubcategory ? `— ${c.name}` : c.name}
      </SelectItem>
    );
  })}
</SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  </div>

                  {/* Sizes with per-size qty — for shirts/trousers/shoes */}
                  {hasSizes && (
                    <div>
                      <p className="text-xs uppercase tracking-widest font-bold mb-2">Sizes &amp; Stock</p>
                      <p className="text-[10px] text-muted-foreground mb-3">Check a size to add it. Set quantity for each selected size.</p>
                      <div className="space-y-2">
                        {availableSizes.map(size => {
                          const inv = watchedSizeInventory ?? [];
                          const item = inv.find(s => s.size === size);
                          const isChecked = !!item;
                          return (
                            <div key={size} className="flex items-center gap-3 border border-border p-2.5">
                              <Checkbox
                                className="rounded-none"
                                checked={isChecked}
                                onCheckedChange={checked => toggleSize(size, !!checked)}
                              />
                              <span className="text-xs font-bold uppercase tracking-wider w-10 flex-shrink-0">
                                {categorySlug === "shoes" ? `UK ${size}` : size}
                              </span>
                              <div className="flex-1 flex items-center gap-2">
                                {isChecked ? (
                                  <>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={item?.qty ?? 0}
                                      onChange={e => updateQty(size, Number(e.target.value))}
                                      className="h-7 w-20 rounded-none border-border text-xs"
                                      placeholder="Qty"
                                    />
                                    <span className="text-[10px] text-muted-foreground">units</span>
                                    {(item?.qty ?? 0) === 0 && (
                                      <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wide">Out of Stock</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground">Not available</span>
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
                  )}

                  {/* Ties: just quantity (no sizes) */}
                  {isTie && (
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Stock Quantity</FormLabel>
                        <FormControl><Input type="number" min={0} className="rounded-none border-border" {...field} /></FormControl>
                        <p className="text-[10px] text-muted-foreground">Ties have no size selection. Enter total available quantity.</p>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  )}

                  {/* Watches & belts: just quantity (no sizes) */}
                  {isNoSize && (
                    <FormField control={form.control} name="stock" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-widest font-bold">Stock Quantity</FormLabel>
                        <FormControl><Input type="number" min={0} className="rounded-none border-border" {...field} /></FormControl>
                        <p className="text-[10px] text-muted-foreground">No size selection for this category.</p>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )} />
                  )}
                </div>

                {/* Right column — image URL */}
                <div className="space-y-4">
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-widest font-bold">Product Image URL</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none border-border text-xs"
                          placeholder="https://i.imgur.com/example.jpg"
                          {...field}
                          onChange={e => {
                            field.onChange(e);
                            setImagePreview(e.target.value);
                          }}
                        />
                      </FormControl>
                      <p className="text-[10px] text-muted-foreground">
                        Paste a direct image link from Imgur, Cloudinary, or any image host.
                      </p>
                      {(imagePreview || field.value) && (
                        <div className="aspect-[4/3] bg-muted border border-border overflow-hidden mt-2">
                          <img
                            src={getImageUrl(imagePreview || field.value || "")}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                          />
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
                    <Textarea className="resize-none min-h-[80px] rounded-none border-border" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              <div className="flex gap-8 border-t border-border pt-6">
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
                <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="rounded-none font-bold uppercase text-xs tracking-widest px-8">
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
