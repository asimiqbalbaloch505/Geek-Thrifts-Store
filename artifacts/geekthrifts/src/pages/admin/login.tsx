import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "asimiqbalbaloch505@gmail.com", password: "Asim@39794" },
  });

  useEffect(() => {
    if (isAuthenticated) setLocation("/admin/dashboard");
  }, [isAuthenticated, setLocation]);

  const onSubmit = (values: LoginValues) => {
    adminLogin.mutate({ data: values }, {
      onSuccess: (data) => {
        if (data.success && data.token) {
          login(data.token);
          setLocation("/admin/dashboard");
        }
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans text-foreground">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-serif text-2xl font-bold tracking-tighter uppercase cursor-pointer hover:opacity-80 transition-opacity">GeekThrifts.</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">Admin Portal</p>
        </div>

        <div className="border border-border bg-card p-8 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-admin-login">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold">Admin Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="admin@geekthrifts.com"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-admin-email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold">Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-admin-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-none uppercase font-bold tracking-widest text-xs mt-2"
                disabled={adminLogin.isPending}
                data-testid="button-admin-login"
              >
                {adminLogin.isPending ? "Authenticating..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
