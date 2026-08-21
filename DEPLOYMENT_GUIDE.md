# 🚀 Vercel Canlıya Alma ve E-posta Kurulum Rehberi (Deployment Guide)

Bu rehber, **KotiScout** gayrimenkul analiz radarını Vercel ve bulut ortamında 2 dakikada canlıya almanız için gereken tüm adımları içerir.

---

## 1. ⚡ Vercel Üzerinde Tek Tıkla Canlıya Alma

1. **[Vercel Dashboard](https://vercel.com/dashboard)** sayfasına gidin ve giriş yapın.
2. **"Add New Project"** butonuna tıklayın.
3. GitHub hesabınızı seçip **`muzafferkoluman/Etuovi-web-scraper`** reposunu içe aktarın (Import).
4. Proje ayarlarında:
   - **Framework Preset:** `Vite` (veya `Other`)
   - **Root Directory:** `./` (Kök dizin)
   - **Build Command:** `npm run build`
   - **Output Directory:** `apps/web/dist`
   - **Install Command:** `npm install`
5. **"Deploy"** butonuna basın! Vercel 1 dakika içinde sitenizi derleyip size canlı bir `https://etuovi-web-scraper.vercel.app` bağlantısı verecektir.

---

## 2. 📬 E-posta Anlık Bildirimleri Kurulumu (Resend veya SMTP)

Lina için otomatik çalışan arama radarları kelepir (%85+ puan) veya fiyat indirimi bulduğunda anında e-posta gönderebilmesi için Vercel üzerinde **Environment Variables (Ortam Değişkenleri)** alanına şu değişkenleri ekleyin:

### Seçenek A: Resend API (Önerilen - Ücretsiz & Hızlı)
1. **[Resend.com](https://resend.com)** üzerinden ücretsiz hesap açıp bir API Key alın.
2. Vercel Environment Variables kısmına ekleyin:
   ```env
   RESEND_API_KEY=re_123456789...
   NOTIFICATION_EMAIL_TO=lina@kotiscout.fi
   NOTIFICATION_EMAIL_FROM=KotiScout Radar <onboarding@resend.dev>
   ```

### Seçenek B: Standart SMTP (Gmail / Outlook)
```env
NOTIFICATION_EMAIL_TO=lina@kotiscout.fi
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ornek@gmail.com
SMTP_PASS=uygulama_sifreniz
```

*(Not: API Key girilmediğinde sistem sıfır hata ile **Simulation / Geliştirici Modunda** çalışır ve logları konsola yazar).*

---

## 3. 🧪 Canlı Test ve Doğrulama

- Sitede **Notifications** sayfasına gidip **"Test Email Alert"** butonuna basarak Lina'nın e-posta adresine anlık test bildirimi gönderebilirsiniz!
