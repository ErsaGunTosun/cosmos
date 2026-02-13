# Docker ile Noir Kurulum Rehberi 🐳

Bu rehber, Noir uygulamasını tamamen Docker kullanarak, tek komutla nasıl çalıştıracağını anlatır.

## 1. Hazırlık: Docker Kurulumu

Sunucunda Docker yoksa aşağıdaki komutlarla kurabilirsin:

```bash
# Docker'ın resmi anahtarını ekle:
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Depoyu ekle:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update

# Docker paketlerini kur:
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Kurulumu test et:
sudo docker run hello-world
```

## 2. Proje Kurulumu

**Projeyi Sunucuya Aktar:**

Dosyalarını (veya `git clone` ile) sunucuna kopyala. Örneğin `/home/ubuntu/cosmos` klasörüne.

**Ortam Dosyasını (.env) Oluştur:**

Proje klasörünün içine gir ve `.env` dosyasını oluştur:

```bash
cd cosmos
nano .env
```
İçine sadece şunu yapıştır:
```env
JWT_SECRET="buraya_uzun_ve_zor_bir_sifre_yaz"
# DATABASE_URL yazmana gerek yok, Docker otomatik halledecek.
```

**Zorunlu Klasörü Oluştur:**

Yüklenen resimlerin kaybolmaması için `public` klasörünün altında `uploads` olduğundan emin ol:

```bash
mkdir -p public/uploads
```

## 3. Uygulamayı Başlat (Sihirli Kısım) ✨

Şu komutu çalıştırarak arka planda başlat:

```bash
sudo docker compose up -d --build
```

**Durumu Kontrol Et:**

```bash
sudo docker compose ps
# Çıktıda 'noir-app' ve 'noir-db' "Up" olarak görünmeli.
```
Uygulaman artık **3000** portunda çalışıyor!

## 4. Veritabanını Doldur

Veritabanı en başta boştur. Tabloları oluşturmak için aşağıdaki komutu **TEK SEFERDE** kopyalayıp yapıştır:

```bash
sudo docker exec -it noir-db psql -U cosmos_user -d cosmos -c "
CREATE TABLE IF NOT EXISTS photos (
    id SERIAL PRIMARY KEY,
    src TEXT NOT NULL,
    original_src TEXT,
    cluster TEXT,
    location TEXT,
    sort_order INTEGER DEFAULT 0,
    exif_data JSONB,
    blur_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile (
    id SERIAL PRIMARY KEY,
    name TEXT,
    username TEXT,
    bio TEXT,
    avatar_url TEXT
);

INSERT INTO profile (id, name, username, bio) 
VALUES (1, 'Müge', 'faithme', 'Photographer based in Istanbul') 
ON CONFLICT DO NOTHING;
"
```

## 5. Alan Adına Bağlama (Opsiyonel)

Eğer uygulamanı `http://senin-siten.com` gibi 80 portundan yayınlamak istersen, sunucuya Nginx kurup yönlendirme yapabilirsin.

**Nginx Kur:**
```bash
sudo apt install -y nginx
```

**Ayarları Yap:**
```bash
sudo nano /etc/nginx/sites-available/noir
```

İçine şunu yapıştır (alan adını değiştir):
```nginx
server {
    listen 80;
    server_name seninsiten.comVEYAsunucuip;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    client_max_body_size 20M; # Büyük dosya yüklemeye izin ver
}
```

**Aktif Et:**
```bash
sudo ln -s /etc/nginx/sites-available/noir /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```
Tebrikler! 🎉
