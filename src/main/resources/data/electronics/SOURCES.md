# Electronics catalog data — sources

Rule: a fact is filled only when sources agree; otherwise it stays empty. `source: "verified"` needs two
independent sources for every fact of the model/variant, otherwise it is `claude-draft`.

## Batch 1 (2026-11-08) — phones, `claude-draft`
- Apple iPhone 13 Mini … iPhone 17 Pro Max (20 models): chipset, screen inches, refresh rate, main/front camera MP,
  IP rating, official color names (English, as Apple names them), storage variants.
  Not filled: RAM and battery mAh (Apple does not publish them), `dualSim` for the 17 family (SIM setup differs by region,
  the Air is eSIM only).
- Samsung Galaxy S23 … S25 Ultra (9 models): chipset (S24 / S24+ = Exynos 2400 for Europe/Turkey, processor family left
  empty because the enum has no Exynos value), screen inches, battery mAh, camera MP, wired charging W, standard colors
  (no online-exclusive colors), RAM/storage variants as sold in Europe.
- Written from memory of the manufacturers' spec pages; to promote to `verified`, check each fact against the
  manufacturer page and one independent spec database.

## Batch 2 (2026-11-08) — phones, `claude-draft`
- Google Pixel 6 … Pixel 8 Pro (7): Tensor chipsets (processor family left empty: no Tensor value), battery mAh,
  screen, refresh rate, launch colors (+ Mint for Pixel 8 / 8 Pro), RAM/storage. Fractional front cameras left out.
- Samsung Galaxy A34, A35, A54, A55, A56 (5): Exynos / Dimensity chipsets, "Awesome" launch colors, European RAM/storage
  variants. A36 not filled (colors and variants not certain).
- Xiaomi 13, 14, 14 Ultra, 15 and POCO F6, F6 Pro, X6 Pro (7): global variants and battery (15 = 5240 mAh global);
  Xiaomi 15 colors left out (differ by market). Redmi Note 13/14 Pro left out: same names cover 4G and 5G phones with
  different chipsets, the catalog needs separate models first.

## Batch 3 (2026-11-08) — tablets and MacBooks, `claude-draft`
- iPad (9 models, 2021–2024): chip, screen, display type, refresh rate, 12 MP cameras, launch colors; variants =
  storage x Wi-Fi / Wi-Fi + Cellular (variant spec `supports5g`). RAM only on iPad Pro (Apple: 8 GB up to 512 GB,
  16 GB with 1–2 TB); battery left out (Apple gives Wh, not mAh).
- Samsung Galaxy Tab S8 / S9 / S9 FE / S10 (10): chipset, battery mAh, screen, colors, Wi-Fi RAM/storage variants.
  5G variants left out (availability differs by market).
- MacBook Air M1–M3 and MacBook Pro M3–M4 (15): variants are every build-to-order RAM x SSD combination of the chip
  bin (CPU/GPU core counts in the variant name and `gpuModel`). Base M1/M2/M3 13" GPU core count depends on the build,
  so `gpuModel` is empty there.
- Windows laptops not filled: one model name covers many CPU/GPU/RAM/SSD builds per market; needs a per-SKU source.

## Batch 4 (2026-11-08) — consoles, headphones, smartwatches, `claude-draft`
- Consoles (13): editions as variants with storage and storage type (PS5 825 GB, Slim 1 TB, Pro 2 TB; Xbox Series X/S;
  Switch OLED/Lite eMMC; Switch 2 256 GB without type: UFS has no StorageType value; Steam Deck, ROG Ally, Legion Go).
  PlayStation Portal / VR2 and MSI Claw left out.
- Headphones (25): connection, ANC, microphone, battery = manufacturer single-charge hours (earbuds without case, ANC
  on). AirPods 4 ANC / non-ANC are variants. Gaming 2.4 GHz headsets left out (no matching connection type).
- Smartwatches (12): Apple Watch SE 2 / Series 9 / 10 / Ultra 2 and Galaxy Watch4–7 / Ultra: chip, OS, NFC, storage;
  variants = case size x GPS/Cellular (Samsung: Bluetooth/LTE). Samsung battery left out (differs by size).
- Not filled: TVs and monitors (one model name covers several sizes and panel SKUs), cameras, speakers, home appliances.

## Batch 5 (2026-11-08) — cameras, TVs, monitors, speakers, `claude-draft`
- Cameras (55): Canon, Nikon, Sony, Fujifilm, GoPro sensor resolution (`cameraMegapixels`, as the maker rounds it).
  DJI and Insta360 left out (photo resolution differs by mode / lens).
- TVs (13): LG OLED B3/B4/C1–C4/G3/G4, Samsung S90C/S95C/S95D, Sony A80L/A95L; one variant per screen size (variant
  spec `screenSize`), OS, panel, native refresh rate. LCD/QLED ranges left out (size-dependent panels and refresh rates).
- Monitors (20): Dell UltraSharp / Alienware, LG UltraGear / UltraFine, Apple; nominal size (`screenSize`, e.g. 31.5"
  sold as 32"), exact diagonal, panel, native refresh rate (no overclock values).
- Speakers (10): JBL and Bose portable Bluetooth speakers, maker playtime and speakerphone microphone. Mains-powered
  and soundbar models left out.

Next: other phone brands, Windows laptops per SKU, other tablet brands, LCD/QLED TVs and other monitors per size.
