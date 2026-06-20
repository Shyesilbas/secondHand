import os
import re

def find_matching_close_tag(content, start_idx, tag_name):
    # Traces from start_idx to find the matching close tag
    counter = 1
    ptr = start_idx
    
    # We look for <tag_name or </tag_name
    open_tag = f"<{tag_name}"
    close_tag = f"</{tag_name}>"
    
    while ptr < len(content):
        if content[ptr:ptr+len(open_tag)] == open_tag:
            # Check if it's not self-closing
            tag_end = content.find('>', ptr)
            if tag_end != -1:
                tag_content = content[ptr:tag_end]
                if not tag_content.strip().endswith('/'):
                    counter += 1
                ptr = tag_end + 1
            else:
                ptr += len(open_tag)
        elif content[ptr:ptr+len(close_tag)] == close_tag:
            counter -= 1
            if counter == 0:
                return ptr
            ptr += len(close_tag)
        else:
            ptr += 1
            
    return -1

def replace_container(file_path, pattern, replacement):
    full_path = os.path.join("/Users/serhat/IdeaProjects/secondHand", file_path)
    if not os.path.exists(full_path):
        print(f"File not found: {full_path}")
        return False
        
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    match = re.search(pattern, content)
    if not match:
        print(f"Pattern '{pattern}' not found in {file_path}")
        return False
        
    start_idx = match.start()
    end_idx = match.end()
    
    # Extract tag name from the matched string
    tag_match = re.search(r'<([a-zA-Z0-9]+)', match.group(0))
    if not tag_match:
        print(f"Could not extract tag name from match {match.group(0)}")
        return False
        
    tag_name = tag_match.group(1)
    
    # Adjust start_idx to only cover the tag itself
    tag_start_in_match = match.group(0).find(f"<{tag_name}")
    actual_start_idx = start_idx + tag_start_in_match
    
    close_idx = find_matching_close_tag(content, actual_start_idx + len(tag_name) + 1, tag_name)
    if close_idx == -1:
        print(f"Matching close tag for {tag_name} starting at {actual_start_idx} not found in {file_path}")
        return False
        
    # Replace opening and closing tags
    close_tag_len = len(tag_name) + 3 # </tag_name>
    
    # The replacement should replace only the tag portion in match.group(0)
    match_str = match.group(0)
    prefix_of_match = match_str[:tag_start_in_match]
    
    new_content = content[:actual_start_idx] + replacement + content[end_idx:close_idx] + "</PageContainer>" + content[close_idx+close_tag_len:]
    
    # Prepend import statement at the very top of the file
    import_stmt = "import PageContainer from '@/common/components/layout/PageContainer';\n"
    # Remove existing import of PageContainer if any
    new_content = re.sub(r"import\s+PageContainer\s+from\s+['\"].*?['\"];?\n?", "", new_content)
    new_content = import_stmt + new_content
    
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Successfully modified {file_path} (replaced {tag_name})")
    return True

# Define all targets
targets = [
    # 1. FavoriteListDetailPage (standard)
    ("secondhand-frontend/src/favoritelist/pages/FavoriteListDetailPage.jsx", r'<div className="mx-auto max-w-6xl p-4 sm:p-6">', '<PageContainer className="p-4 sm:p-6">'),
    ("secondhand-frontend/src/favoritelist/pages/FavoriteListDetailPage.jsx", r'<div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">', '<PageContainer className="space-y-6 p-4 sm:p-6">'),
    
    # 2. OrdersListLayout (standard)
    ("secondhand-frontend/src/order/components/shared/OrdersListLayout.jsx", r'<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">', '<PageContainer className="py-3.5">'),
    ("secondhand-frontend/src/order/components/shared/OrdersListLayout.jsx", r'<div className=\{containerClassName \|\| \'max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10\'\}>', '<PageContainer className={containerClassName || \'py-10\'}>'),
    
    # 3. OrderShipmentPage (narrow)
    ("secondhand-frontend/src/order/pages/OrderShipmentPage.jsx", r'<div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-6">', '<PageContainer narrow className="pt-8 sm:pt-10 space-y-6">'),
    
    # 4. OrderSuccessPage (narrow)
    ("secondhand-frontend/src/order/pages/OrderSuccessPage.jsx", r'<div className="max-w-3xl mx-auto px-4 py-10 relative z-10">', '<PageContainer narrow className="py-10 relative z-10">'),
    
    # 5. OffersPage (standard)
    ("secondhand-frontend/src/offer/pages/OffersPage.jsx", r'<div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">', '<PageContainer className="py-6 sm:py-7">'),
    
    # 6. PaymentsPage (standard)
    ("secondhand-frontend/src/payments/pages/PaymentsPage.jsx", r'<div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">', '<PageContainer className="py-4 flex items-center justify-between">'),
    ("secondhand-frontend/src/payments/pages/PaymentsPage.jsx", r'<main className="max-w-7xl mx-auto px-6 py-8 w-full">', '<PageContainer className="py-8 w-full">'),
    
    # 7. PaymentMethodsPage (standard)
    ("secondhand-frontend/src/payments/pages/PaymentMethodsPage.jsx", r'<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">', '<PageContainer className="py-10">'),
    
    # 8. PayListingFeePage (standard)
    ("secondhand-frontend/src/payments/pages/PayListingFeePage.jsx", r'<div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 relative z-10">', '<PageContainer className="py-8 lg:py-12 relative z-10">'),
    
    # 9. InboxPage (standard/custom width)
    ("secondhand-frontend/src/inbox/pages/InboxPage.jsx", r'<div className="flex flex-col flex-1 min-h-0 mx-auto w-full max-w-\[min\(100%,1420px\)\] p-4 sm:p-6 lg:p-8">', '<PageContainer className="flex flex-col flex-1 min-h-0 w-full max-w-[min(100%,1420px)] py-4 sm:py-6 lg:py-8">'),
    
    # 10. ChatPage (standard/custom width)
    ("secondhand-frontend/src/chat/pages/ChatPage.jsx", r'return <div className="container mx-auto px-4 py-8">', '<PageContainer className="py-8">'),
    ("secondhand-frontend/src/chat/pages/ChatPage.jsx", r'<div className={`max-w-\[1600px\] mx-auto \$\{embedded \? \'px-0 py-0\' : \'px-6 lg:px-8 py-8\'\}`\}>', '<PageContainer className={`max-w-[1600px] ${embedded ? \'px-0 sm:px-0 lg:px-0 py-0\' : \'py-8\'}`}>'),
    
    # 11. FavoritesPage (standard)
    ("secondhand-frontend/src/favorites/pages/FavoritesPage.jsx", r'<div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">', '<PageContainer className="py-6 sm:py-8">'),
    
    # 12. UserProfilePage (standard)
    ("secondhand-frontend/src/user/pages/UserProfilePage.jsx", r'return <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-5">', '<PageContainer className="pb-5">'),
    ("secondhand-frontend/src/user/pages/UserProfilePage.jsx", r'<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">', '<PageContainer>'),
    ("secondhand-frontend/src/user/pages/UserProfilePage.jsx", r'<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">', '<PageContainer className="py-7">'),
    
    # 13. ProfilePage (standard)
    ("secondhand-frontend/src/user/pages/ProfilePage.jsx", r'<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', '<PageContainer className="py-8">'),
    ("secondhand-frontend/src/user/pages/ProfilePage.jsx", r'<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', '<PageContainer className="py-8">'),
    
    # 14. PlatformCouponsPage (standard)
    ("secondhand-frontend/src/coupon/pages/PlatformCouponsPage.jsx", r'<div className="mx-auto max-w-5xl px-4 pb-10">', '<PageContainer className="pb-10">'),
    
    # 15. SellerDashboardPage (standard)
    ("secondhand-frontend/src/dashboard/pages/SellerDashboardPage.jsx", r'<div className="max-w-7xl mx-auto px-6 py-6">', '<PageContainer className="py-6 px-6">'),
    ("secondhand-frontend/src/dashboard/pages/SellerDashboardPage.jsx", r'<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">', '<PageContainer className="py-6 px-6 space-y-6">'),
    
    # 16. BuyerDashboardPage (standard)
    ("secondhand-frontend/src/dashboard/pages/BuyerDashboardPage.jsx", r'<div className="max-w-7xl mx-auto px-6 py-6">', '<PageContainer className="py-6 px-6">'),
    ("secondhand-frontend/src/dashboard/pages/BuyerDashboardPage.jsx", r'<div className="max-w-7xl mx-auto px-6 py-6 space-y-6">', '<PageContainer className="py-6 px-6 space-y-6">'),
    
    # 17. ComplaintsPage (standard)
    ("secondhand-frontend/src/complaint/pages/ComplaintsPage.jsx", r'<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">', '<PageContainer className="flex items-center justify-between py-4">'),
    ("secondhand-frontend/src/complaint/pages/ComplaintsPage.jsx", r'<div className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">', '<PageContainer className="pb-10 pt-6">'),
    
    # 18. ForumPage (standard)
    ("secondhand-frontend/src/forum/pages/ForumPage.jsx", r'<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">', '<PageContainer>'),
    ("secondhand-frontend/src/forum/pages/ForumPage.jsx", r'<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">', '<PageContainer className="py-6">'),
    
    # 19. ShoppingCartPage (standard)
    ("secondhand-frontend/src/cart/pages/ShoppingCartPage.jsx", r'<div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">', '<PageContainer className="flex h-14 items-center justify-between py-0">'),
    ("secondhand-frontend/src/cart/pages/ShoppingCartPage.jsx", r'<main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">', '<PageContainer className="py-6 sm:py-8">'),
    
    # 20. CheckoutPage (standard)
    ("secondhand-frontend/src/cart/pages/CheckoutPage.jsx", r'<div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">', '<PageContainer className="py-3">'),
    ("secondhand-frontend/src/cart/pages/CheckoutPage.jsx", r'<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">', '<PageContainer className="py-6">'),
    
    # 21. ListingDetailPage (standard)
    ("secondhand-frontend/src/listing/pages/ListingDetailPage.jsx", r'<div className="max-w-\[1220px\] mx-auto px-4 sm:px-6 lg:px-8 pt-5">', '<PageContainer className="max-w-[1220px] pt-5">'),
    ("secondhand-frontend/src/listing/pages/ListingDetailPage.jsx", r'<div className="max-w-\[1220px\] mx-auto px-4 sm:px-6 lg:px-8 h-\[52px\] flex items-center justify-between gap-4">', '<PageContainer className="max-w-[1220px] h-[52px] flex items-center justify-between gap-4">'),
    ("secondhand-frontend/src/listing/pages/ListingDetailPage.jsx", r'<main className="max-w-\[1220px\] mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">', '<PageContainer className="max-w-[1220px] pt-4 sm:pt-6">'),
    
    # 22. UserReviewsPage (standard)
    ("secondhand-frontend/src/reviews/pages/UserReviewsPage.jsx", r'<div className="container mx-auto px-4 py-10">', '<PageContainer className="py-10">'),
    
    # 23. MyCouponsPage (standard)
    ("secondhand-frontend/src/campaign/pages/MyCouponsPage.jsx", r'<div className="relative max-w-6xl mx-auto px-4 py-6">', '<PageContainer className="relative py-6">'),
    
    # 24. AuthLayout (narrow)
    ("secondhand-frontend/src/common/components/layout/AuthLayout.jsx", r'<div className="flex flex-col flex-1 justify-between px-6 py-10 sm:px-12 md:px-16 lg:px-18 xl:px-20 max-w-xl mx-auto w-full">', '<PageContainer narrow className="flex-col flex-1 justify-between py-10 px-6 sm:px-12 md:px-16 lg:px-18 xl:px-20 w-full">'),
    
    # 25. AgreementsPage (narrow)
    ("secondhand-frontend/src/agreements/pages/AgreementsPage.jsx", r'<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', '<PageContainer narrow className="py-8">'),
    ("secondhand-frontend/src/agreements/pages/AgreementsPage.jsx", r'<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">', '<PageContainer narrow className="py-8">'),
    
    # 26. SecurityPage (narrow)
    ("secondhand-frontend/src/audit/pages/SecurityPage.jsx", r'<div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">', '<PageContainer narrow className="h-16 flex items-center justify-between">'),
    ("secondhand-frontend/src/audit/pages/SecurityPage.jsx", r'<div className="max-w-6xl mx-auto px-6 py-12">', '<PageContainer narrow className="py-12">'),
    ("secondhand-frontend/src/audit/pages/SecurityPage.jsx", r'<div className="max-w-6xl mx-auto space-y-8">', '<PageContainer narrow className="space-y-8">'),
    
    # 27. AuraChatPage (narrow)
    ("secondhand-frontend/src/ai/pages/AuraChatPage.jsx", r'<div className="max-w-3xl mx-auto px-4 py-8 w-full space-y-6">', '<PageContainer narrow className="py-8 w-full space-y-6">'),
    
    # 28. OrderShipmentPage (narrow)
    ("secondhand-frontend/src/order/pages/OrderShipmentPage.jsx", r'<div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 space-y-6">', '<PageContainer narrow className="pt-8 sm:pt-10 space-y-6">'),
    
    # 29. OrderSuccessPage (narrow)
    ("secondhand-frontend/src/order/pages/OrderSuccessPage.jsx", r'<div className="max-w-3xl mx-auto px-4 py-10 relative z-10">', '<PageContainer narrow className="py-10 relative z-10">'),
    
    # 30. AccountHubPage (max-w-4xl override)
    ("secondhand-frontend/src/user/pages/AccountHubPage.jsx", r'<div className="max-w-4xl mx-auto">', '<PageContainer className="max-w-4xl">'),
]

for file_path, pattern, replacement in targets:
    replace_container(file_path, pattern, replacement)
