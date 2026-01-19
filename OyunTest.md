Sirket deposit hammadde Kalite Q1-Q2 mekanizmasi denetlenmeli. calismiyor.

depososit matarielde kalite farkini düzenlememiz gerek.
yani, kisi sirketini yükselttiginde hammadde ihtiyaci ayni kalitede olmali. q2 sirket q2 hammadde. bunu check edelim.

Harika, temel yapı taşlarını (
IDSCard
, 
IDSLabel
) oluşturarak ilk büyük adımı attık. Yapıyı bozmadan, Dashboard estetiğini koruyarak daha temiz bir mimariye geçmek için şu 3 ana alanda ilerleyebiliriz:

1. Dashboard "Atomlarını" Global Hale Getirmek
Dashboard sayfasındaki o çok sevdiğin "ResourcePill" (enerji/para barları), "QuickLink" ve "MissionIcon" gibi bileşenler şu an sadece Dashboard dosyasının içinde hapsolmuş durumda.

Aksiyon: Bunları components/ui/ids altına taşıyıp, tüm sayfalarda (Market, Training, Battle) aynı Dashboard tarzı küçük butonları ve bilgi kutucuklarını kullanabiliriz.
2. İş Mantığını (Logic) Hook'lara Ayırmak
Şu an 
TrainingCenter.tsx
 veya 
MarketSell.tsx
 dosyaları hem "ne göründüğünü" hem de "arka planda ne döndüğünü" (maliyet hesaplama, contract tetikleme, cooldown kontrolü vb.) biliyor.

Aksiyon: useTraining veya useMarket gibi Custom Hooklar oluşturabiliriz. Böylece bileşen (Component) sadece "IDSCard içine şu veriyi yaz" diyecek, hesaplamaları Hook yapacak. Kodun okunabilirliği %50 artar.
3. Renk ve Stil "Token"ları (Theme)
Dashboard'daki o özel bg-slate-800/60 veya border-slate-700/50 değerlerini merkezi bir ids-theme.ts (veya Tailwind config) üzerinden yönetebiliriz.

Aksiyon: Renkleri isimler (IDS_COLORS.SURFACE, IDS_COLORS.ACCENT) ile çağırırsak, Dashboard'daki o tasarımı tek bir noktadan tüm oyuna yaymış oluruz.
