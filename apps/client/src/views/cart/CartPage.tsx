import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../hooks/useCart";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Button } from "../../ui/primitives/Button";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";

const CartPage: React.FC = () => {
  const { cartQuery, updateItem, removeItem } = useCart();
  const { add } = useToastStore();
  const navigate = useNavigate();

  // Ensure data is an array before using reduce
  const cartItems = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  
  // Calculate subtotal using discounted price if available, otherwise regular price
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.service?.discountedPrice || item.service?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const handleQuantityChange = (item: any, newQuantity: number) => {
    // Limit to 1
    if (newQuantity > 1) {
      add({ title: "Maximum 1 quantity per service", kind: "error" });
      return;
    }
    if (newQuantity < 1) {
      removeItem.mutate(item.id);
      return;
    }
    updateItem.mutate({ id: item.id, quantity: newQuantity });
  };

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
                  <Button className="mt-4" onClick={() => navigate("/services")}>
                    Browse Services
                  </Button>
                </CardContent>
              </Card>
            )}
            {cartItems.map((item) => {
              const price = item.service?.discountedPrice || item.service?.price || 0;
              const originalPrice = item.service?.price || 0;
              const hasDiscount = item.service?.discountedPrice && item.service.discountedPrice < originalPrice;
              
              return (
                <Card key={item.id}>
                  <CardContent className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold">{item.service?.title ?? "Service"}</h3>
                      <p className="text-slate-400 text-sm">{item.service?.description}</p>
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="text-slate-400">Quantity:</span>
                        <span className="font-semibold">{item.quantity}</span>
                        <span className="text-slate-500 text-xs">(Max 1 per service)</span>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      {hasDiscount && (
                        <div>
                          <p className="text-sm text-slate-400 line-through">
                            ₹{(originalPrice * item.quantity).toLocaleString("en-IN")}
                          </p>
                          <p className="text-lg font-semibold text-green-400">
                            ₹{(price * item.quantity).toLocaleString("en-IN")}
                          </p>
                        </div>
                      )}
                      {!hasDiscount && (
                        <p className="text-lg font-semibold">
                          ₹{(price * item.quantity).toLocaleString("en-IN")}
                        </p>
                      )}
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
              );
            })}
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
                <Button 
                  block 
                  onClick={() => navigate("/checkout")}
                  disabled={cartItems.length === 0}
                >
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
