# Response Format Inventory

## Auth Package
- `src/main/java/com/serhat/secondHand/auth/api/AuthController.java`
  - `ResponseEntity.ok(...)` (lines 60, 88, 106, 122, 138)
  - `ResponseEntity.status(HttpStatus.FOUND)` (line 71)
- `src/main/java/com/serhat/secondHand/auth/api/PasswordController.java`
  - `ResponseEntity.ok(...)` (lines 41, 65, 87)

## Listing Package
- `src/main/java/com/serhat/secondHand/listing/api/VehicleListingController.java`
  - `ResponseEntity.ok(...)` (lines 61, 71, 79)
- `src/main/java/com/serhat/secondHand/listing/api/ListingViewController.java`
  - `ResponseEntity.ok().build()` (line 50)
  - `ResponseEntity.ok(stats)` (line 65)
- `src/main/java/com/serhat/secondHand/listing/api/PriceHistoryController.java`
  - `ResponseEntity.ok(...)` (lines 24, 33, 39)
  - `ResponseEntity.notFound().build()` (line 31)
- `src/main/java/com/serhat/secondHand/listing/api/ListingController.java`
  - `ResponseEntity.ok(...)` (lines 89, 102, 113, 136, 145, 190, 196, 241, 257)
- `src/main/java/com/serhat/secondHand/listing/api/support/CategoryListingControllerSupport.java`
  - `ResponseEntity.created(...).body(...)` (line 41)
- `src/main/java/com/serhat/secondHand/listing/api/LocationCatalogController.java`
  - `ResponseEntity.ok(...)` (lines 20, 26, 32)
- `src/main/java/com/serhat/secondHand/listing/api/BooksListingController.java`
  - `ResponseEntity.ok(...)` (lines 55, 62)
- `src/main/java/com/serhat/secondHand/listing/api/RealEstateController.java`
  - `ResponseEntity.ok(...)` (lines 51, 71)
- `src/main/java/com/serhat/secondHand/listing/api/SportsListingController.java`
  - `ResponseEntity.ok(...)` (lines 62, 70)
- `src/main/java/com/serhat/secondHand/listing/api/ClothingListingController.java`
  - `ResponseEntity.ok(...)` (lines 64, 75, 84)
- `src/main/java/com/serhat/secondHand/listing/api/ElectronicListingController.java`
  - `ResponseEntity.ok(...)` (lines 63, 73, 82)
- `src/main/java/com/serhat/secondHand/listing/api/RealEstateCatalogController.java`
  - `ResponseEntity.ok(...)` (lines 30, 35)

## Ewallet Package
- `src/main/java/com/serhat/secondHand/ewallet/api/EWalletController.java`
  - `ResponseEntity.ok(...)` (lines 37, 44, 62, 71, 79, 88, 96, 118)

## Ai Package
- `src/main/java/com/serhat/secondHand/ai/api/AiChatController.java`
  - `ResponseEntity.ok(...)` (line 33)
  - `ResponseEntity.noContent().build()` (lines 40, 47, 54)
- `src/main/java/com/serhat/secondHand/ai/api/GeminiController.java`
  - `ResponseEntity.ok(...)` (lines 32, 45)
- `src/main/java/com/serhat/secondHand/ai/api/AiSummaryController.java`
  - `ResponseEntity.ok(...)` (lines 24, 29)
- `src/main/java/com/serhat/secondHand/ai/agent/api/AgentController.java`
  - `ResponseEntity.ok(...)` (lines 62, 70)
