Web3War Kontrat-Frontend Entegrasyon Test Planı
Tüm sayfalardaki kontrat entegrasyonlarının kapsamlı test ve düzeltme planı.

Mevcut Durum
Frontend Sayfaları: 10 sayfa Move Kontratları: 13 modül ContractService Fonksiyonları: 50+ fonksiyon

📋 Test Checklist
1. Dashboard Sayfası (/dashboard)
Özellik	Kontrat Fonksiyonu	Durum
Profil verisi	
getProfile()
⬜ Test edilecek
CRED bakiyesi	
getCoinBalance()
⬜ Test edilecek
SUPRA bakiyesi	
getSupraBalance()
⬜ Test edilecek
Envanter	
getInventory()
⬜ Test edilecek
Dashboard data	
getDashboardData()
⬜ Test edilecek
2. Companies Sayfası (/companies)
Özellik	Kontrat Fonksiyonu	Durum
Tüm şirketleri listele	
getAllCompanies()
⬜ Test edilecek
Yeni şirket oluştur	
createCompany()
⚠️ BİLİNEN HATA: Kontrat imzalanıyor ama frontend'de görünmüyor
İş ilanı aç	
postJobOffer()
⬜ Test edilecek
Para yatır	
depositCompanyFunds()
⬜ Test edilecek
Kalite yükselt	
upgradeCompanyQuality()
⬜ Test edilecek
Ürün çek	
withdrawCompanyProduct()
⬜ Test edilecek
Hammadde yatır	
depositCompanyRaw()
⬜ Test edilecek
3. Industrial Sayfası (/industrial)
Özellik	Kontrat Fonksiyonu	Durum
İş al	
takeJob()
⬜ Test edilecek
İstifa et	
resignJob()
⬜ Test edilecek
Çalış (iş yap)	
performWork()
⬜ Test edilecek
4. Training Sayfası (/training)
Özellik	Kontrat Fonksiyonu	Durum
Training bilgisi al	
getTrainingInfo()
✅ Çalışıyor
Fiyatlandırma al	
getTrainingPricing()
✅ Çalışıyor
Çoklu antrenman	
trainMulti()
✅ Çalışıyor
Bina yükselt	
upgradeTrainingGrounds()
✅ DÜZELTİLDİ
5. Market Sayfası (/market)
Özellik	Kontrat Fonksiyonu	Durum
Kategori bazlı listing	
getMarketListingsByCategory()
⬜ Test edilecek
Ürün listele	
listMarketItem()
⬜ Test edilecek
Ürün satın al	
buyMarketItem()
⬜ Test edilecek
Kendi listinglerim	
getMyListings()
⬜ Test edilecek
Listing iptal	
cancelListing()
⬜ Test edilecek
6. Battles Sayfası (/battles)
Özellik	Kontrat Fonksiyonu	Durum
Aktif savaş detayları	
getActiveBattleDetails()
⬜ Test edilecek
Round detayları	
getBattleRoundDetails()
⬜ Test edilecek
Round data	
getRoundData()
⬜ Test edilecek
Savaş bilgisi	
getBattleInfo()
⬜ Test edilecek
Savaş geçmişi	
getBattleHistory()
⬜ Test edilecek
Savaş ilan et	
declareWar()
⬜ Test edilecek
Savaş (fight)	
fight()
⬜ Test edilecek
Round bitir	
endRound()
⬜ Test edilecek
Savaş bitir	
endBattle()
⬜ Test edilecek
7. Politics Sayfası (/politics)
Özellik	Kontrat Fonksiyonu	Durum
Ülke verisi	
getCountryData()
⬜ Test edilecek
Teklifler	
getProposals()
⬜ Test edilecek
Kongre üyesi kontrol	
checkCongressMember()
⬜ Test edilecek
Adaylar	
getCandidates()
⬜ Test edilecek
Aday ol	
registerCandidate()
⬜ Test edilecek
Oy ver	
vote()
⬜ Test edilecek
Teklif oluştur	
createProposal()
⬜ Test edilecek
Teklif oy	
voteProposal()
⬜ Test edilecek
8. Map Sayfası (/map)
Özellik	Kontrat Fonksiyonu	Durum
Bölge verileri	territory modülü	⬜ Test edilecek
9. Profile Sayfası (/profile)
Özellik	Kontrat Fonksiyonu	Durum
Kayıt kontrol	
checkRegistration()
⬜ Test edilecek
Vatandaş kayıt	
registerCitizen()
⬜ Test edilecek
Profil al	
getProfile()
⬜ Test edilecek
Enerji yenile	
recoverEnergy()
⬜ Test edilecek
10. Newspaper Sayfası (/newspaper)
Özellik	Kontrat Fonksiyonu	Durum
Gazete oluştur	
createNewspaper()
⬜ Test edilecek
Makale yayınla	
publishArticle()
⬜ Test edilecek
Makale onayla	
endorseArticle()
⬜ Test edilecek
Tüm gazeteler	
getAllNewspapers()
⬜ Test edilecek
Gazete makaleleri	
getNewspaperArticles()
⬜ Test edilecek
11. Military Unit (Henüz sayfa yok?)
Özellik	Kontrat Fonksiyonu	Durum
Birlik oluştur	
createMilitaryUnit()
⬜ Frontend entegrasyonu kontrol
Birliğe katıl	
joinMilitaryUnit()
⬜ Frontend entegrasyonu kontrol
Günlük emir	
setDailyOrder()
⬜ Frontend entegrasyonu kontrol
Üye birliği al	
getMemberUnit()
⬜ Frontend entegrasyonu kontrol
12. Admin Fonksiyonları
Özellik	Kontrat Fonksiyonu	Durum
Admin kontrol	
isAdmin()
⬜ Test edilecek
Registry başlat	
initializeAdminRegistry()
⬜ Test edilecek
Kredi mint	
mintCredits()
⬜ Test edilecek
Enerji ekle	
addEnergy()
⬜ Test edilecek
🔴 Öncelikli Düzeltmeler
1. Companies - Yeni Şirket Görünmüyor
Problem: 
createCompany()
 kontratı imzalanıyor ama frontend yenilendiğinde şirket görünmüyor.

Olası Sebepler:

 
getAllCompanies()
 fonksiyonu yanlış parse ediyor
 Şirket owner field'ı ile frontend karşılaştırması uyumsuz
 State yenileme (refetch) eksik
Aksiyon:

Console log'larını kontrol et
RPC response'u incele
Parse mantığını doğrula
📝 Test Prosedürü
Her sayfa için:

Okuma İşlemleri

Sayfa yüklendiğinde doğru veri geliyor mu?
Console'da hata var mı?
RPC response'ları doğru parse ediliyor mu?
Yazma İşlemleri (Transaction)

İşlem Starkey'de doğru görünüyor mu?
Args doğru serialize ediliyor mu?
Transaction onaylandıktan sonra UI güncelleniyor mu?
Hata Durumları

400 hatası var mı? (serialization sorunu)
LINKER_ERROR var mı? (kontrat uyumsuzluğu)
Network timeout var mı?
🚀 Sonraki Adımlar
Companies sayfası analizi - Yeni şirket sorunu
Sayfa sayfa sistematik test
Bulunan hataların düzeltilmesi
Walkthrough dökümanı hazırlanması