import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSignup } from "@workspace/api-client-react";
import { useUserAuth } from "@/hooks/use-user-auth";
import { Link, useLocation } from "wouter";
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

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (isUserLoggedIn) setLocation("/");
  }, [isUserLoggedIn, setLocation]);

  const onSubmit = (values: SignupValues) => {
    const payload = {
      name: values.name.trim(),
      email: values.email.toLowerCase().trim(),
      password: values.password.trim(),
    };

    signupMutation.mutate({ data: payload }, {
      onSuccess: (data) => {
        userLogin(data.token, data.user);
        toast({ title: "Account created!", description: `Welcome to GeekThrifts, ${data.user.name}.` });
        setLocation("/");
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({ title: "Signup failed", description: message ?? "Something went wrong. Please try again.", variant: "destructive" });
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
            <p className="text-[13px] text-gray-500 mt-2">Create your account</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text"
                autoComplete="name"
                placeholder="Ahmed Khan"
                className="w-full h-11 px-4 border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                {...form.register("name")}
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-[12px] mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
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
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className="w-full h-11 px-4 border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-red-500 text-[12px] mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-gray-700 mb-1.5">Confirm Password</label>
              <input
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full h-11 px-4 border border-gray-200 text-[14px] text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword && (
                <p className="text-red-500 text-[12px] mt-1">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full h-11 bg-gray-900 text-white text-[12px] uppercase tracking-[0.15em] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {signupMutation.isPending ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-[13px] text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/login">
              <span className="text-gray-900 font-semibold underline underline-offset-2 cursor-pointer hover:opacity-70 transition-opacity">Sign in</span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}