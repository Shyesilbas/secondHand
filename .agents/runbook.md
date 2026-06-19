# Runbook

## Decision Flow
1. Task hangi domaini etkiliyor?
2. O domainin README'si ne diyor?
3. Degisim controller/service/validator/repository/mapper zincirinin neresinde?
4. Cache, event, auth veya money flow var mi?
5. En kucuk dogru diff nedir?

## Change Pattern
- Contract degisiyorsa DTO + mapper + controller birlikte.
- Business rule degisiyorsa validator + service birlikte.
- Query degisiyorsa repository + mapper birlikte.
- Side effect degisiyorsa event/listener veya async handler birlikte.

## Do Not
- Tum depoyu tarama.
- Kurali birden fazla katmana kopyalama.
- Eski endpoint veya alan adini dokumanda tutma.
- Buyuk refactor'u is acil degilken tek turda yapma.

