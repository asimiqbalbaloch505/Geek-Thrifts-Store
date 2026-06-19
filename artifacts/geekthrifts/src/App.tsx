import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/hooks/use-auth";
import { UserAuthProvider } from "@/hooks/use-user-auth";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Products from "@/pages/products";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import OrderStatus from "@/pages/order-status";
import Shipping from "@/pages/shipping";
import ReturnPolicy from "@/pages/return-policy";
import FAQs from "@/pages/faqs";
import PrivacyPolicy from "@/pages/privacy-policy";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      
      {/* Info Pages */}
      <Route path="/order-status" component={OrderStatus} />
      <Route path="/shipping" component={Shipping} />
      <Route path="/return-policy" component={ReturnPolicy} />
      <Route path="/faqs" component={FAQs} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/products" component={AdminProducts} />
      <Route path="/admin/categories" component={AdminCategories} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserAuthProvider>
          <AuthProvider>
            <CartProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
              </WouterRouter>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </UserAuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
