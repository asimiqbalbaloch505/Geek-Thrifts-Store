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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit, Plus, Trash2, FolderTree } from "lucide-react";
import { format } from "date-fns";

const categorySchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and hyphens only"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.number().nullable().optional(), 
  isActive: z.boolean(),
});

type CategoryValues = z.infer<typeof categorySchema>;

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

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
      description: "",
      imageUrl: "",
      parentId: null,
      isActive: true,
    }
  });

  const openAddDialog = () => {
    setEditingCategory(null);
    form.reset({
      name: "",
      slug: "",
      description: "",
      imageUrl: "",
      parentId: null,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      imageUrl: category.imageUrl || "",
      parentId: category.parentId ?? null,
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
    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        data: values
      }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsDialogOpen(false);
        }
      });
    } else {
      createCategory.mutate({
        data: values
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

            return (
              <div key={category.id} className="border border-border bg-card flex flex-col group relative overflow-hidden">
                <div className="aspect-[2/1] bg-muted border-b border-border relative">
                  {category.imageUrl ? (
                    <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] uppercase text-muted-foreground font-bold tracking-widest">No Image</div>
                  )}

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                    {parentCat && (
                      <span className="text-[9px] uppercase tracking-widest bg-black text-white px-2 py-0.5 font-bold flex items-center gap-1">
                        <FolderTree className="w-3 h-3" /> Sub of: {parentCat.name}
                      </span>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <Button variant="outline" size="icon" className="rounded-none h-10 w-10 bg-background border-border" onClick={() => openEditDialog(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" className="rounded-none h-10 w-10" onClick={() => handleDelete(category.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-6 font-sans flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-serif font-bold text-xl uppercase tracking-wider">{category.name}</div>
                    {!category.isActive && (
                      <span className="text-[10px] uppercase tracking-widest bg-muted text-foreground px-2 py-1 font-bold">Draft</span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-muted-foreground mb-4">/{category.slug}</div>
                  <div className="text-sm text-muted-foreground mb-6 line-clamp-2">{category.description || "No description"}</div>
                  
                  <div className="mt-auto flex justify-between items-center text-[10px] uppercase tracking-widest font-bold border-t border-border pt-4">
                    <div>{category.productCount ?? 0} Products</div>
                    <div>Added {format(new Date(category.createdAt), "MMM yyyy")}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Category Dialog */}
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

              {/* Parent Category Field */}
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
              
              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Image URL</FormLabel>
                  <FormControl><Input className="rounded-none border-border" {...field} /></FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Description</FormLabel>
                  <FormControl>
                    <Textarea className="resize-none min-h-[100px] rounded-none border-border" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )} />

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