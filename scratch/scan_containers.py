import os
import re

files_to_scan = [
    "secondhand-frontend/src/favoritelist/pages/FavoriteListDetailPage.jsx",
    "secondhand-frontend/src/order/components/shared/OrdersListLayout.jsx",
    "secondhand-frontend/src/order/pages/OrderShipmentPage.jsx",
    "secondhand-frontend/src/order/pages/OrderSuccessPage.jsx",
    "secondhand-frontend/src/order/pages/ISoldPage.jsx",
    "secondhand-frontend/src/order/pages/MyOrdersPage.jsx",
    "secondhand-frontend/src/offer/pages/OffersPage.jsx",
    "secondhand-frontend/src/home/pages/HomePage.jsx",
    "secondhand-frontend/src/payments/pages/PaymentsPage.jsx",
    "secondhand-frontend/src/payments/pages/PaymentMethodsPage.jsx",
    "secondhand-frontend/src/payments/pages/PayListingFeePage.jsx",
    "secondhand-frontend/src/inbox/pages/InboxPage.jsx",
    "secondhand-frontend/src/chat/pages/ChatPage.jsx",
    "secondhand-frontend/src/auth/pages/AccountVerificationPage.jsx",
    "secondhand-frontend/src/auth/pages/OAuthErrorPage.jsx",
    "secondhand-frontend/src/auth/pages/ChangePasswordPage.jsx",
    "secondhand-frontend/src/auth/pages/ForgotPasswordPage.jsx",
    "secondhand-frontend/src/auth/pages/OAuthCallbackPage.jsx",
    "secondhand-frontend/src/auth/pages/LoginPage.jsx",
    "secondhand-frontend/src/auth/pages/RegisterPage.jsx",
    "secondhand-frontend/src/auth/pages/OAuthCompletePage.jsx",
    "secondhand-frontend/src/favorites/pages/FavoritesPage.jsx",
    "secondhand-frontend/src/emails/pages/EmailsPage.jsx",
    "secondhand-frontend/src/admin/pages/AdminCouponsPage.jsx",
    "secondhand-frontend/src/agreements/pages/AgreementsPage.jsx",
    "secondhand-frontend/src/user/pages/AccountHubPage.jsx",
    "secondhand-frontend/src/user/pages/UserProfilePage.jsx",
    "secondhand-frontend/src/user/pages/ProfilePage.jsx",
    "secondhand-frontend/src/coupon/pages/PlatformCouponsPage.jsx",
    "secondhand-frontend/src/dashboard/pages/SellerDashboardPage.jsx",
    "secondhand-frontend/src/dashboard/pages/BuyerDashboardPage.jsx",
    "secondhand-frontend/src/complaint/pages/ComplaintsPage.jsx",
    "secondhand-frontend/src/forum/pages/ForumPage.jsx",
    "secondhand-frontend/src/common/components/layout/SidebarLayout.jsx",
    "secondhand-frontend/src/common/components/layout/AuthLayout.jsx",
    "secondhand-frontend/src/common/components/layout/MainLayout.jsx",
    "secondhand-frontend/src/audit/pages/SecurityPage.jsx",
    "secondhand-frontend/src/ai/pages/AuraChatPage.jsx",
    "secondhand-frontend/src/campaign/pages/MyCouponsPage.jsx",
    "secondhand-frontend/src/cart/pages/ShoppingCartPage.jsx",
    "secondhand-frontend/src/cart/pages/CheckoutPage.jsx",
    "secondhand-frontend/src/listing/components/ListingsModuleLayout.jsx",
    "secondhand-frontend/src/listing/pages/CreateListingPage.jsx",
    "secondhand-frontend/src/listing/pages/ListingsPrefilterPage.jsx",
    "secondhand-frontend/src/listing/pages/MyListingsPage.jsx",
    "secondhand-frontend/src/listing/pages/ListingDetailPage.jsx",
    "secondhand-frontend/src/listing/pages/ListingsPage.jsx",
    "secondhand-frontend/src/listing/pages/EditListingPage.jsx",
    "secondhand-frontend/src/reviews/pages/UserReviewsPage.jsx"
]

patterns = [
    r'max-w-5xl', r'max-w-6xl', r'max-w-7xl', r'max-w-\[',
    r'mx-auto',
    r'px-4', r'px-6', r'px-8', r'px-10'
]

results = []

for filepath in files_to_scan:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    for idx, line in enumerate(lines):
        line_num = idx + 1
        # We look for div (or main, section, etc but let's check any elements with className containing the patterns)
        # The prompt says "div'ler", "container div'leri", "wrapper div'leri"
        if '<div' in line or '<main' in line or '<section' in line:
            # check if any pattern is present in className
            class_match = re.search(r'className=["\'`]([^"\'`]+)["\'`]', line)
            if class_match:
                classes = class_match.group(1)
                # Check target criteria
                has_max_w = any(p in classes for p in ['max-w-5xl', 'max-w-6xl', 'max-w-7xl', 'max-w-['])
                has_mx_auto = 'mx-auto' in classes
                has_px = any(p in classes for p in ['px-4', 'px-6', 'px-8', 'px-10'])
                
                if has_max_w or has_mx_auto or has_px:
                    results.append({
                        'file': filepath,
                        'line': line_num,
                        'content': line.strip()
                    })

# Generate report in Markdown format
report_lines = [
    "# Container Inventory",
    "",
    "Inventory of container-related divs found in `*Page.jsx` and `*Layout.jsx` files under `src/`.",
    "",
]

current_file = None
for r in results:
    if r['file'] != current_file:
        current_file = r['file']
        report_lines.append(f"\n### [{os.path.basename(current_file)}](file://{os.path.abspath(current_file)})")
        report_lines.append(f"Path: `{current_file}`\n")
    report_lines.append(f"- Line {r['line']}: `{r['content']}`")

output_path = ".agents/CONTAINER_INVENTORY.md"
with open(output_path, 'w', encoding='utf-8') as f:
    f.write("\n".join(report_lines))

print(f"Scanned {len(files_to_scan)} files. Found {len(results)} matches. Inventory saved to {output_path}.")
