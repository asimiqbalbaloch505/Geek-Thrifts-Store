import { AdminLayout } from "@/components/admin-layout";
import { 
  useListCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  getListCategoriesQueryKey,
  Category
} from "@workspace/api-client-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2, FolderTree, X } from "lucide-react";
import { format } from "date-fns";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  parentId: z.number().nullable().optional(), 
  sizes: z.array(z.string()).default([]),
  isActive: z.boolean(),
});

type CategoryValues = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newSizeInput, setNewSizeInput] = useState("");

  const { data: categories, isLoading } = useListCategories({
    query: { queryKey: getListCategoriesQueryKey() }
  });

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      slug: "",
      parentId: null,
      sizes: [],
      isActive: true,
    }
  });

  const currentSizes = form.watch("sizes") || [];

  const addSize = () => {
    const trimmed = newSizeInput.trim().toUpperCase();
    if (trimmed && !currentSizes.includes(trimmed)) {
      form.setValue("sizes", [...currentSizes, trimmed]);
      setNewSizeInput("");
    }
  };

  const removeSize = (sizeToRemove: string) => {
    form.setValue("sizes", currentSizes.filter(s => s !== sizeToRemove));
  };

  const openAddDialog = () => {
    setEditingCategory(null);
    setNewSizeInput("");
    form.reset({
      name: "",
      slug: "",
      parentId: null,
      sizes: [],
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setNewSizeInput("");
    form.reset({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId ?? null,
      sizes: category.sizes || [],
      isActive: category.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category? This might affect products linked to it.")) {
      deleteCategory.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
      });
    }
  };

  const onSubmit = (values: CategoryValues) => {
    const payload = {
      ...values,
      parentId: values.parentId ? Number(values.parentId) : null,
      sizes: values.sizes ?? [],
    };

    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        data: payload
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        }
      });
    } else {
      createCategory.mutate({
        data: payload
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-8 border-b border-border pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold uppercase tracking-tighter mb-2">Categories</h1>
          <p className="text-muted-foreground text-sm">Organize your products into collections and subcategories.</p>
        </div>
        <Button onClick={openAddDialog} className="rounded-none uppercase font-bold tracking-widest text-xs h-10 px-6 flex gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">Loading...</div>
        ) : !categories || categories.length === 0 ? (
          <div className="col-span-full p-12 text-center text-muted-foreground font-sans text-sm uppercase tracking-widest border border-border">No categories found</div>
        ) : (
          categories.map(category => {
            const parentCat = categories.find(c => c.id === category.parentId);
            const sizesToDisplay = category.sizes && category.sizes.length > 0
              ? category.sizes
              : parentCat?.sizes || [];

            return (
              <div key={category.id} className="border border-border bg-card flex flex-col p-6 group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-serif font-bold text-xl uppercase tracking-wider">{category.name}</div>
                  <div className="flex items-center gap-2">
                    {!category.isActive && (
                      <span className="text-[10px] uppercase tracking-widest bg-muted text-foreground px-2 py-0.5 font-bold">Draft</span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {parentCat && (
                  <span className="text-[9px] uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold self-start mb-3 flex items-center gap-1">
                    <FolderTree className="w-3 h-3" /> Subcategory of: {parentCat.name}
                  </span>
                )}

                <div className="text-xs font-mono text-muted-foreground mb-3">/{category.slug}</div>

                <div className="mb-6">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Available Sizes</div>
                  <div className="flex flex-wrap gap-1">
                    {sizesToDisplay.length > 0 ? (
                      sizesToDisplay.map(size => (
                        <span key={size} className="text-[10px] border border-border px-2 py-0.5 font-mono uppercase font-bold bg-muted">
                          {size}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">No sizes (Direct Stock)</span>
                    )}
                  </div>
                </div>

                <div className="mt-auto flex justify-between items-center text-[10px] uppercase tracking-widest font-bold border-t border-border pt-4">
                  <div>{category.productCount ?? 0} Products</div>
                  <div>Added {format(new Date(category.createdAt), "MMM yyyy")}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md rounded-none border border-border p-6 bg-background">
          <DialogHeader className="mb-6 pb-4 border-b border-border">
            <DialogTitle className="font-serif text-2xl font-bold uppercase tracking-tighter">
              {editingCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-sans">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Name</FormLabel>
                  <FormControl>
                    <Input 
                      className="rounded-none border-border" 
                      {...field} 
                      onChange={(e) => {
                        field.onChange(e);
                        if (!editingCategory) {
                          form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
                        }
                      }} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Slug (URL)</FormLabel>
                  <FormControl><Input className="rounded-none border-border font-mono text-sm" {...field} /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              <FormField control={form.control} name="parentId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Parent Category (Optional)</FormLabel>
                  <Select 
                    onValueChange={(val) => field.onChange(val === "none" ? null : Number(val))} 
                    value={field.value ? String(field.value) : "none"}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-none border-border">
                        <SelectValue placeholder="None (Main Category)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none">
                      <SelectItem value="none">None (Main Category)</SelectItem>
                      {categories?.filter(c => !c.parentId && c.id !== editingCategory?.id).map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              {/* Sizes Setup Field */}
              <div className="space-y-2">
                <FormLabel className="text-xs uppercase tracking-widest font-bold">Category Sizes</FormLabel>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. S, M, L, XL or 8, 9, 10" 
                    value={newSizeInput} 
                    onChange={(e) => setNewSizeInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); }}}
                    className="rounded-none border-border text-xs"
                  />
                  <Button type="button" onClick={addSize} variant="outline" className="rounded-none uppercase text-xs font-bold px-4">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {currentSizes.map((size) => (
                    <span key={size} className="inline-flex items-center gap-1 bg-muted border border-border px-2 py-1 text-xs font-mono font-bold uppercase">
                      {size}
                      <button type="button" onClick={() => removeSize(size)} className="hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Leave empty if subcategory should automatically inherit sizes from its parent.
                </p>
              </div>

              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0 pt-2">
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold cursor-pointer">Active (Visible)</FormLabel>
                </FormItem>
              )} />

              <div className="pt-6 border-t border-border flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-none font-bold uppercase text-xs tracking-widest">
                  Cancel
                </Button>
                <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="rounded-none font-bold uppercase text-xs tracking-widest px-8">
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}