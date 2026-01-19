# Web3War Ürün Kataloğu (On-Chain Items)

Bu dosya, Web3War akıllı sözleşmelerinde (Move) tanımlı olan ve frontend tarafında (`inventorySlice.ts`, `AdminToolkit.tsx`) eşlenen tüm ürünleri listeler.

## 1. Hammaddeler (Material - Category 3)
Sanayi üretimi ve ekonomi çarklarının dönmesi için gereken temel kaynaklar.

| ID | İsim | Simge | Kategori | Kullanım Alanı |
|:---|:---|:---:|:---:|:---|
| 101 | **Grain (Tahıl)** | 🌾 | 3 | Gıda üretimi ve temel ihtiyaçlar. |
| 102 | **Iron (Iron Ore)**| ⚒️ | 3 | Silah, mühimmat ve inşaat. |
| 103 | **Oil (Petrol)** | 🛢️ | 3 | Enerji ve sanayi üretimi. |
| 104 | **Aluminum** | 💎 | 3 | Teknoloji ve hafif sanayi. |

---

## 2. Tüketilebilir Ürünler (Food - Category 1)
Vatandaşların enerji (Energy) seviyelerini geri kazanması için kullanılan ürünler.

| ID | İsim | Simge | Kategori | Enerji Geri Kazanımı (Formül: Q * 20) |
|:---|:---|:---:|:---:|:---|
| 201 | **Food** | 🍞 | 1 | Q1: +20, Q2: +40, Q3: +60, Q4: +80, Q5: +100 |

---

## 3. Askeri Ekipmanlar (Weapon - Category 2)
Savaşlarda hasar potansiyelini belirleyen ekipmanlar.

| ID | İsim | Simge | Kategori | Hasar Katsayısı (Formül: Q * Base) |
|:---|:---|:---:|:---:|:---|
| 202 | **Weapon (Standard)** | ⚔️ | 2 | Standart askeri güç (Q1-Q5). |
| 204 | **Missile** | 🚀 | 2 | Yüksek yıkım gücü (Q1-Q5). |

---

## 4. Özel ve Görev Eşyaları (Specialized - Category 4)
Oyun içi mekanikler ve yetkilendirmeler için kullanılan eşyalar.

| ID | İsim | Simge | Kategori | Notlar |
|:---|:---|:---:|:---:|:---|
| 203 | **Ticket** | 🎫 | 4 | Özel etkinlik veya yetki girişleri. |

---

## ⚙️ Teknik Detaylar (Geliştirici Notları)

- **Kalite (Quality)**: Her ürün 1 ile 5 (Q1-Q5) arasında bir kalite seviyesine sahip olabilir. Kalite arttıkça ürünün sağladığı bonuslar (Enerji veya Hasar) doğrusal olarak artar.
- **Sözleşme Adresi**: `inventory.move` modülü altında yönetilir.
- **Admin Mint**: Admin Toolkit üzerinden bu ID ve kategori kombinasyonları ile istenilen miktar ve kalitede ürün üretilebilir.

---

## 🛠️ Supra IDE ile Ürün Üretme (Mint Guide)

Supra IDE üzerinden `admin::mint_item` fonksiyonunu kullanarak manuel ürün üretmek için aşağıdaki parametreleri kullanın:

### Parametre Açıklamaları
*   **arg0 (address)**: Ürünün gönderileceği cüzdan adresi (Kendi adresiniz).
*   **arg1 (u64)**: `item_id` (Yukarıdaki tablolardan ID sütunu).
*   **arg2 (u8)**: `category` (Yukarıdaki tablolardan Kategori sütunu).
*   **arg3 (u8)**: `quality` (1-5 arası kalite seviyesi).
*   **arg4 (u64)**: `quantity` (Üretilecek adet miktarı).

### Örnek Kullanımlar

| Hedef Ürün | arg1 (ID) | arg2 (Cat) | arg3 (Qual) | arg4 (Qty) |
|:---|:---:|:---:|:---:|:---:|
| 50 Adet Demir | 102 | 3 | 1 | 50 |
| 10 Adet Q5 Gıda | 201 | 1 | 5 | 10 |
| 5 Adet Standart Silah | 202 | 2 | 1 | 5 |

> [!TIP]
> IDE üzerinden mint yaptıktan sonra oyuna dönüp envanterdeki **yenileme (↻)** butonuna basmayı unutmayın.

