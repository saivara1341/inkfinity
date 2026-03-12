

# PrintFlow SaaS Enhancement Plan

## Current State Assessment

The app has a solid foundation: multi-tenant architecture, role-based routing, real-time notifications, product catalog with dynamic pricing, cart/checkout flow, and three dashboards (Customer, Shop Owner, Admin). However, several critical gaps prevent it from functioning as a production SaaS.

## Critical Issues to Fix First

### 1. Database Triggers Are Missing
The `handle_new_user` and `notify_order_status_change` functions exist but have NO triggers attached (confirmed in db-triggers section). This means:
- New users don't get profiles or roles created automatically
- Order status changes don't generate notifications

**Fix:** Create migration to attach triggers to `auth.users` (for new signups) and `orders` (for status changes).

### 2. Role Escalation Bug in Shop Registration
`RegisterShop.tsx` and `Signup.tsx` both try to update `user_roles` directly, but customers lack RLS permission to change their own role. The current RLS only allows admins to manage roles.

**Fix:** Create a `register_shop` database function (SECURITY DEFINER) that atomically creates the shop entry AND updates the user role to `shop_owner`, with validation to prevent abuse.

### 3. Design File Upload Not Wired
`ProductCustomize.tsx` allows file selection but never uploads to storage. Checkout references `design_file_url` but it's always null.

**Fix:** Upload design files to the existing `designs` storage bucket during the customize flow, then pass the URL through cart to orders.

## Feature Enhancements

### 4. PWA Support for Android/iOS
Install `vite-plugin-pwa`, configure manifest with PrintFlow branding, add mobile meta tags, and create an `/install` page with install prompt. This gives native-like experience without app stores.

### 5. Product Image Upload for Shop Owners
Create a `product-images` storage bucket. Add image upload UI to `ShopProducts.tsx` form. Display actual images in Storefront product cards.

### 6. Input Validation with Zod
Add zod schemas for: signup forms, shop registration, checkout address, product creation. Validate both client-side and before database calls.

### 7. Password Reset Flow
Create `/forgot-password` and `/reset-password` pages. Wire up `supabase.auth.resetPasswordForEmail()` with proper redirect URL.

### 8. Role-Aware Navbar
Update `Navbar.tsx` to show contextual links based on user role: "My Shop" for shop_owners, "Admin" for admins, "My Orders" for customers.

### 9. Storefront Shop Filter
The `/store?shop=<id>` parameter exists in links but isn't used in the query. Wire it up to filter products by specific shop.

### 10. Error Boundaries & Loading States
Add React error boundary wrapper. Replace "Loading..." text with skeleton components for dashboard cards, product grids, and order tables.

## Implementation Order

```text
Phase 1 - Fix Broken Core (must do first)
  1. Attach database triggers (handle_new_user, notify_order_status_change)
  2. Create register_shop SECURITY DEFINER function
  3. Fix role update flow in RegisterShop.tsx and Signup.tsx

Phase 2 - Complete Missing Features
  4. Wire design file upload to storage
  5. Add product image upload for shop owners
  6. Add password reset flow (/forgot-password, /reset-password)
  7. Add input validation with zod across all forms

Phase 3 - Mobile & Polish
  8. Add PWA support (manifest, service worker, /install page)
  9. Role-aware Navbar
  10. Storefront shop filter
  11. Error boundaries & skeleton loading states
```

## Database Changes Required

- **Migration 1:** Attach `handle_new_user` trigger on `auth.users` AFTER INSERT
- **Migration 2:** Attach `notify_order_status_change` trigger on `orders` AFTER UPDATE
- **Migration 3:** Create `register_shop()` SECURITY DEFINER function that inserts shop + updates role
- **Migration 4:** Create `product-images` storage bucket with public read access
- **Migration 5:** Add RLS policy allowing authenticated users to upload to `designs` bucket

## Files to Create/Modify

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/pages/ForgotPassword.tsx` | Password reset request |
| Create | `src/pages/ResetPassword.tsx` | New password form |
| Create | `src/components/ErrorBoundary.tsx` | Global error boundary |
| Create | `src/lib/validations.ts` | Zod schemas |
| Modify | `src/pages/RegisterShop.tsx` | Use register_shop RPC |
| Modify | `src/pages/Signup.tsx` | Use register_shop RPC for shop signup |
| Modify | `src/components/Navbar.tsx` | Role-aware navigation |
| Modify | `src/pages/Storefront.tsx` | Shop filter from URL params |
| Modify | `src/pages/ProductCustomize.tsx` | Upload design to storage |
| Modify | `src/components/shop/ShopProducts.tsx` | Image upload UI |
| Modify | `src/App.tsx` | Add new routes, error boundary, PWA |
| Modify | `vite.config.ts` | PWA plugin config |
| Modify | `index.html` | PWA meta tags |

