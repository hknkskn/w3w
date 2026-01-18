1. KULLANICI YÖNETİMİ & PROFİL SİSTEMİ
Kayıt & Kimlik:

Kullanıcı adı, email, şifre ile kayıt
Ülke seçimi (başlangıç vatandaşlığı)
Avatar/profil resmi
Deneyim seviyesi (XP sistemi)
Doğum tarihi (hesap oluşturma tarihi)

Profil Bilgileri:

Ekonomik beceri (Economy Skill)
Güç seviyesi (Strength)
Rütbe sistemi (Recruit → God of War)
Madalyalar ve başarılar
Çalışma geçmişi
Savaş istatistikleri

2. EKONOMİK SİSTEM
Para Birimleri:

Gold (premium para birimi)
CC (Country Currency - her ülkenin kendi parası)
Para transferleri, döviz kurları

Çalışma Mekanizması:

Günde 1 kez çalışma hakkı
Şirket sahibi için üretim
Maaş alma (CC veya mal olarak)
Ekonomik beceri kazanımı
Yorgunluk/enerji tüketimi

Şirket Sistemi:

Q1-Q7 kalite seviyeleri
Sektörler: Food, Weapons, Raw Materials, Moving Tickets, Houses, Aircraft, Tanks
Ham madde gereksinimleri
Üretim formülleri
İşçi istihdam etme
Maaş belirleme

Pazar Yeri:

Alım-satım sistemi
Teklif verme/kabul etme
Fiyat belirleme
Envanter yönetimi
Vergi sistemi (satış vergisi, gelir vergisi, ithalat vergisi)

3. SAVAŞ & ASKERI SİSTEM
Antrenman:

Günlük antrenman (train butonu)
Güç kazanımı (+1-5 strength depending on training grounds)
Antrenman tesisi seviyeleri (Q1-Q4)
Antrenman sınırı (günde 1 kez ücretsiz)

Savaş Mekanizması:

Campaign sistemi (bölgeler arası savaşlar)
Battle rounds (her 2 saatte bir round)
Hit atma (enerji tüketimi)
Silah kullanımı (Q1-Q7 weapons)
Food tüketimi (enerji yenileme)
Influence puanı kazanma
Battle Hero madalyası
Zafer/yenilgi sonuçları

Enerji Sistemi:

Maksimum enerji limiti (temel 50 + bonuslar)
Enerji yenileme (yemek, gift, energy bar)
Her hit için enerji maliyeti
Enerji bar'ı dolumu

Askeri Ünite:

Ünite kurma/katılma
Daily order (günlük emir)
Ünite bonusları
Ünite savaşları

4. POLİTİK SİSTEM
Parti Sistemi:

Parti kurma
Parti üyeliği
Parti liderliği
Parti başkanlık seçimleri

Seçimler:

Kongre seçimleri (ayda 1)
Başkanlık seçimleri (ayda 1)
Oy verme mekanizması
Aday olma

Hükümet:

Başkan yetkileri (savaş ilanı, anlaşmalar)
Kongre yetkileri (kanun yapma, vergi belirleme, para basma)
İmpeachment sistemi
Para politikası
Vergi belirleme

5. GÜNLÜK GÖREVLER & ÖDÜLLER
Daily Tasks:

Train (antrenman yap)
Work (çalış)
Fight (savaş, belirli sayıda hit at)
Her görev için ödül (para, gold, item)

Energy Recovery:

Günlük ücretsiz food limitler
Saatlik doğal enerji yenileme
Ev bonusu (Q1-Q7 houses, günlük enerji)
Energy bar kullanımı

6. SOSYAL SİSTEM
Arkadaşlık:

Arkadaş ekleme
Mesajlaşma sistemi
Shout (herkese açık mesaj)
Newspaper (gazete yayınlama)

Organizasyonlar:

Parti
Askeri Ünite
Şirket (çoklu karakter değilse)

7. PREMIUM ÖZELLİKLER
Gold Kullanımı:

Energy bar satın alma
Companies upgrade
Premium hesap özellikleri
Anında antrenman
Extra work shifts

8. BÖLGE & KAYNAK SİSTEMİ
Bölgeler:

Her ülkenin bölgeleri
Bölge kaynakları (High Oil, High Grain, vs.)
Savaş ile bölge ele geçirme
Bölge bonusları (üretim bonusu)

Kaynaklar:

Grain, Oil, Iron, Saltpeter, Sand, Clay, Wood, Aluminum, Rubber, Limestone
Kaynak gereksinimleri (üretim için)

9. DATABASE MİMARİSİ (Web3'e Çevirirken)
SMART CONTRACT YAPISI:

├── UserManagement.sol
│   ├── createProfile()
│   ├── updateProfile()
│   ├── gainXP()
│   └── levelUp()

├── EconomySystem.sol
│   ├── Currency (ERC20 tokens)
│   ├── work()
│   ├── paySalary()
│   ├── transferMoney()
│   └── exchangeCurrency()

├── CompanySystem.sol
│   ├── createCompany()
│   ├── produce()
│   ├── hireWorker()
│   ├── fireWorker()
│   └── calculateProduction()

├── Marketplace.sol
│   ├── listItem()
│   ├── buyItem()
│   ├── cancelListing()
│   └── applyTax()

├── TrainingSystem.sol
│   ├── dailyTrain()
│   ├── gainStrength()
│   ├── checkTrainingCooldown()
│   └── upgradeTrainingGrounds()

├── BattleSystem.sol
│   ├── createBattle()
│   ├── hit()
│   ├── consumeEnergy()
│   ├── useWeapon()
│   ├── calculateDamage()
│   ├── endRound()
│   └── distributeMedals()

├── EnergySystem.sol
│   ├── consumeFood()
│   ├── restoreEnergy()
│   ├── naturalRegeneration()
│   └── checkMaxEnergy()

├── PoliticalSystem.sol
│   ├── createParty()
│   ├── vote()
│   ├── startElection()
│   ├── declareWar()
│   └── proposelaw()

├── DailyQuests.sol
│   ├── checkDailyTasks()
│   ├── claimReward()
│   └── resetDaily()

├── NFTSystem.sol (Web3 Extra)
│   ├── Weapons (NFT)
│   ├── Companies (NFT)
│   ├── Houses (NFT)
│   └── Land/Regions (NFT)

└── Governance.sol (Web3 Extra)
    ├── DAO voting
    ├── Treasury management
    └── Protocol upgrades
10. KRITIK GAME LOOPS
Günlük Döngü (Daily Loop):

Login → Enerji kontrolü
Train → Strength kazanımı
Work → Maaş/üretim
Fight → Battle'lara katıl
Eat → Enerji yenile
Daily tasks'ı tamamla → Ödül al
Marketplace → Alışveriş

Haftalık/Aylık Döngü:

Kongre seçimleri
Başkanlık seçimleri
Savaş stratejileri
Ekonomik büyüme

WEB3 ÖNERİLERİ:

NFT Entegrasyonu: Silahlar, evler, şirketler NFT olabilir
Token Ekonomisi: Dual-token (governance + utility)
DAO Yönetimi: Oyun politikası için
Staking: Pasif gelir için şirket/land stake
P2E Mekanikler: Battle kazançları, daily quest ödülleri
On-chain/Off-chain Hybrid: Gas tasarrufu için
Chainlink VRF: Rastgele damage calculation
The Graph: Oyun verisi sorgulama