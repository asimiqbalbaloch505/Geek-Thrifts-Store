import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@workspace/api-client-react";

export type CartItem = {
  product: Product;
  selectedSize: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQuantity: (productId: number, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  getMaxStock: (product: Product, size: string) => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function getMaxStockForItem(product: any, size: string): number {
  if (!product) return 0;

  let directInv = product.sizeInventory ?? product.size_inventory;
  if (typeof directInv === "string") {
    try {
      directInv = JSON.parse(directInv);
    } catch {
      directInv = [];
    }
  }

  if (Array.isArray(directInv) && directInv.length > 0) {
    const sizeItem = directInv.find(
      (s: any) => String(s.size).toLowerCase() === String(size).toLowerCase()
    );
    if (sizeItem && typeof sizeItem.qty === "number") {
      return sizeItem.qty;
    }
  }

  return product.stock ?? 1;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, quantity: number) => {
    const maxStock = getMaxStockForItem(product, size);

    setItems((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id && item.selectedSize === size
      );
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.selectedSize === size
            ? { ...item, quantity: Math.min(item.quantity + quantity, maxStock) }
            : item
        );
      }
      return [...current, { product, selectedSize: size, quantity: Math.min(quantity, maxStock) }];
    });
  };

  const removeFromCart = (productId: number, size: string) => {
    setItems((current) =>
      current.filter(
        (item) => !(item.product.id === productId && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (productId: number, size: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((current) =>
      current.map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          const maxStock = getMaxStockForItem(item.product, size);
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        getMaxStock: getMaxStockForItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}