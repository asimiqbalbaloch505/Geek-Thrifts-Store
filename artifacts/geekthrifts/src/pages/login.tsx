import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { userLogin, isUserLoggedIn } = useUserAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (isUserLoggedIn) setLocation("/");
  }, [isUserLoggedIn, setLocation]);

  const onSubmit = (values: LoginValues) => {
    // Normalize email input to lowercase and trim spaces for mobile keyboards
    const normalizedData = {
      email: values.email.toLowerCase().trim(),
      password: values.password.trim(),
    };

    loginMutation.mutate({ data: normalizedData }, {
      onSuccess: (data) => {
        userLogin(data.token, data.user);
        toast({ title: "Welcome back!", description: `Good to see you, ${data.user.name}.` });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Login failed", description: "Invalid email or password.", variant: "destructive" });
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <Link href="/">
              <span className="font-serif text-2xl font-bold text-gray-900 cursor-pointer hover:opacity-75 transition-opacity">GeekThrifts</span>
            </Link>
            <p className="text-[13px] text-gray-500 mt-2">Sign in to your account</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                autoCapitalize="none"
                autoCorrect="off"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full h-11 px-4 border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-[12px] mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full h-11 px-4 border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-[12px] mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-11 bg-gray-900 text-white text-[12px] uppercase tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Don't have an account?{" "}
            <Link href="/signup">
              <span className="text-gray-900 font-semibold underline underline-offset-2 cursor-pointer hover:opacity-70 transition-opacity">Create one</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}