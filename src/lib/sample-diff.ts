export const SAMPLE_DIFF = `diff --git a/src/components/ProductCard.tsx b/src/components/ProductCard.tsx
new file mode 100644
--- /dev/null
+++ b/src/components/ProductCard.tsx
@@ -0,0 +1,43 @@
+import React, { useState } from 'react';
+
+interface Product {
+  id: number;
+  name: string;
+  price: number;
+  imageUrl: string;
+  rating: number;
+}
+
+export function ProductCard({ product }: { product: Product }) {
+  const [quantity, setQuantity] = useState(1);
+
+  return (
+    <div className="product-card" onClick={() => window.location.href = '/product/' + product.id}>
+      <img src={product.imageUrl} />
+      <div className="product-info">
+        <h3 style={{ color: '#aaaaaa' }}>{product.name}</h3>
+        <span className="price">\${product.price}</span>
+        <div className="rating">
+          {[1,2,3,4,5].map(star => (
+            <span key={star} style={{ color: star <= product.rating ? '#ffcc00' : '#cccccc' }}>★</span>
+          ))}
+        </div>
+        <div className="quantity-control">
+          <button onClick={(e) => { e.stopPropagation(); setQuantity(q => q - 1); }}>-</button>
+          <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
+          <button onClick={(e) => { e.stopPropagation(); setQuantity(q => q + 1); }}>+</button>
+        </div>
+        <button
+          className="add-to-cart"
+          onClick={(e) => { e.stopPropagation(); addToCart(product, quantity); }}
+        >
+          Add to Cart
+        </button>
+      </div>
+    </div>
+  );
+}
+
+function addToCart(product: Product, quantity: number) {
+  fetch('/api/cart', {
+    method: 'POST',
+    body: JSON.stringify({ productId: product.id, quantity }),
+  });
+}
`;
