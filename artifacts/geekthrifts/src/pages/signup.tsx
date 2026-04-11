import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignup } from "@workspace/api-client-react";
import { useUserAuth } from "@/hooks/use-user-auth";
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

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
type SignupValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const { userLogin, isUserLoggedIn } = useUserAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const signupMutation = useSignup();

  useEffect(() => {
    if (isUserLoggedIn) setLocation("/");
  }, [isUserLoggedIn, setLocation]);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = (values: SignupValues) => {
    signupMutation.mutate({
      data: { name: values.name, email: values.email, password: values.password }
    }, {
      onSuccess: (data) => {
        userLogin(data.token, data.user);
        toast({ title: "Account created!", description: `Welcome to GeekThrifts, ${data.user.name}.` });
        setLocation("/");
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({
          title: "Signup failed",
          description: message ?? "Something went wrong. Please try again.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/">
            <span className="font-serif text-2xl font-bold tracking-tighter uppercase cursor-pointer hover:opacity-80 transition-opacity">GeekThrifts.</span>
          </Link>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">Create Your Account</p>
        </div>

        <div className="border border-border bg-card p-8 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" data-testid="form-signup">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ahmed Khan"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold">Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-email"
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
                        placeholder="Min. 6 characters"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest font-bold">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Re-enter your password"
                        className="h-12 rounded-none border-border focus-visible:ring-foreground"
                        data-testid="input-confirm-password"
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
                disabled={signupMutation.isPending}
                data-testid="button-signup"
              >
                {signupMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login">
                <span className="font-bold underline underline-offset-4 cursor-pointer hover:opacity-70 transition-opacity">Sign in</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
