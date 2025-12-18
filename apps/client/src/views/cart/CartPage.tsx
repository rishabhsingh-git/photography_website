import React from "react";
import { useCart } from "../../hooks/useCart";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Button } from "../../ui/primitives/Button";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const CartPage: React.FC = () => {
  const { cartQuery, updateItem, removeItem } = useCart();
  const { add } = useToastStore();

  // Ensure data is an array before using reduce
  const cartItems = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  const subtotal =
    cartItems.reduce((sum, item) => sum + (item.service?.price ?? 0) * item.quantity, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cart</p>
        <h1 className="text-3xl font-semibold text-slate-50">Your curated services.</h1>
      </div>

      {cartQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!cartQuery.isLoading && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-3">
            {cartItems.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-slate-400">Your cart is empty</p>
                </CardContent>
              </Card>
            )}
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{item.service?.title ?? "Service"}</h3>
                    <p className="text-slate-400 text-sm">{item.service?.description}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })
                        }
                      >
                        -
                      </Button>
                      <span>{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-lg font-semibold">
                      ₹{((item.service?.price ?? 0) * item.quantity).toLocaleString("en-IN")}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        await removeItem.mutateAsync(item.id);
                        add({ title: "Removed from cart", kind: "info" });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardContent className="space-y-3">
                <h3 className="text-lg font-semibold">Summary</h3>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-300">
                  <span>Taxes & fees</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between text-base font-semibold text-slate-50">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <Button block onClick={() => (window.location.href = "/checkout")}>
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;


