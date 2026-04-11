import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAdminLogin } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
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
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const adminLogin = useAdminLogin();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    }
  });

  const onSubmit = (values: LoginValues) => {
    adminLogin.mutate({
      data: values
    }, {
      onSuccess: (data) => {
        if (data.success && data.token) {
          login(data.token);
          setLocation("/admin");
        }
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid username or password.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 font-sans text-foreground">
      <div className="w-full max-w-md p-8 md:p-12 border border-border bg-card">
        <div className="text-center mb-10">
          <h1 className="font-serif text-2xl font-bold tracking-tighter uppercase mb-2">GeekThrifts.</h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Admin Portal</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest font-bold">Username</FormLabel>
                  <FormControl>
                    <Input 
                      className="h-12 rounded-none border-border focus-visible:ring-foreground" 
                      placeholder="admin" 
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
                      className="h-12 rounded-none border-border focus-visible:ring-foreground" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full h-12 rounded-none uppercase font-bold tracking-widest text-xs mt-4"
              disabled={adminLogin.isPending}
            >
              {adminLogin.isPending ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
