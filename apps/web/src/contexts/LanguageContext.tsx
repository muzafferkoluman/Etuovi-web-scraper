import React, { createContext, useContext, useState, useEffect } from "react";

export type SupportedLanguage = "en" | "fi" | "ru" | "tr";

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", flag: "🇫🇮" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", flag: "🇹🇷" }
];

export const translations = {
  en: {
    // Nav
    "nav.dashboard": "Dashboard",
    "nav.explore": "Explore Properties",
    "nav.favorites": "Favorites",
    "nav.compare": "Compare",
    "nav.liveFeed": "Etuovi Live",
    "nav.radarActive": "Radar Active",
    "nav.notifications": "Live Notifications",
    "nav.markAllRead": "Mark all read",
    "nav.noNotifications": "No active notifications yet. Price drops and radar matches will appear here.",
    "nav.viewAll": "View all notification logs →",

    // Dashboard
    "dash.welcome": "Welcome back, Lina! 👋",
    "dash.welcomeSub": "Live Etuovi real estate market intelligence and price drop radar dashboard.",
    "dash.searchBtn": "Explore Listings",
    "dash.manageRadars": "Manage Radars",
    "dash.statListings": "Live Listings Pool",
    "dash.statDrops": "Price Drops Detected",
    "dash.statRadars": "Automated Search Radars",
    "dash.statFavorites": "My Favorites",
    "dash.unitListings": "listings",
    "dash.unitDrops": "bargains",
    "dash.unitActive": "active",
    "dash.unitSaved": "saved",
    "dash.citySelectSuffix": "Region Listings",
    "dash.cityJumpBtn": "Explore Listings",
    "dash.radarCompleted": "Search Radar Execution Completed",
    "dash.topBargains": "Top Bargains & High Match Scores",
    "dash.viewAll": "View all",
    "dash.priceDrops": "Recent Price Reductions",
    "dash.viewAllDrops": "View all price drops",
    "dash.activeRadars": "Active Search Radars",
    "dash.noRadars": "No active search radars yet. You can save your search filters as a radar on the explore page.",
    "dash.manage": "Manage →",
    "dash.minScore": "Min Score",
    "dash.running": "Scanning...",
    "dash.runNow": "Run Now",
    "dash.compareDock": "Comparison List",
    "dash.compareNow": "Compare →",
    "dash.personalRadar": "Personal Data Radar",
    "dash.personalRadarDesc": "All your property search filters and price drop alerts are automatically tracked in real-time.",

    // Property Card & Details
    "prop.built": "Built",
    "prop.maintenance": "Maintenance",
    "prop.sqmPrice": "€/m²",
    "prop.rooms": "Rooms",
    "prop.floor": "Floor",
    "prop.energyClass": "Energy Class",
    "prop.balcony": "Balcony",
    "prop.sauna": "Sauna",
    "prop.elevator": "Elevator",
    "prop.viewOnEtuovi": "View on Etuovi.com",
    "prop.priceHistory": "Price Drop History",
    "prop.noPriceHistory": "No price reductions recorded yet. Price remains at initial asking level.",
    "prop.askPrice": "Asking Price",
    "prop.livingArea": "Living Area",
    "prop.details": "Property Details",

    // Search & Filters
    "search.title": "Property Explorer",
    "search.results": "properties found",
    "search.filters": "Advanced Filters",
    "search.clearAll": "Clear all",
    "search.keywordPlaceholder": "Search by address, district, street...",
    "search.city": "City / Municipality",
    "search.district": "Districts in Helsinki",
    "search.price": "Price Range (€)",
    "search.area": "Living Area (m²)",
    "search.buildYear": "Build Year",
    "search.maxMaintenance": "Max Maintenance Fee (€/mo)",
    "search.amenities": "Features & Amenities",
    "search.sortBy": "Sort By",
    "search.sortNewest": "Newest listings first",
    "search.sortOldest": "Oldest listings first",
    "search.sortPriceLow": "Price: Low to High",
    "search.sortPriceHigh": "Price: High to Low",
    "search.sortSqmLow": "Price per m²: Low to High",
    "search.sortSqmHigh": "Price per m²: High to Low",
    "search.sortAreaHigh": "Area: Largest first",
    "search.sortScoreHigh": "AI Score: Highest first",
    "search.saveRadar": "Save as Radar",
    "search.noResults": "No properties match your filter criteria. Try expanding price or location limits.",

    // Common
    "common.loading": "Loading live data from Etuovi...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.close": "Close"
  },

  fi: {
    // Nav
    "nav.dashboard": "Ohjauspaneeli",
    "nav.explore": "Selaa Asuntoja",
    "nav.favorites": "Suosikit",
    "nav.compare": "Vertaile",
    "nav.liveFeed": "Etuovi Live",
    "nav.radarActive": "Tutka Aktiivinen",
    "nav.notifications": "Ilmoitukset",
    "nav.markAllRead": "Merkitse luetuiksi",
    "nav.noNotifications": "Ei aktiivisia ilmoituksia. Hintalaskut ja uudet osumat näkyvät täällä.",
    "nav.viewAll": "Katso kaikki ilmoitukset →",

    // Dashboard
    "dash.welcome": "Tervetuloa, Lina! 👋",
    "dash.welcomeSub": "Reaaliaikainen Etuovi-asuntomarkkinoiden seuranta ja hintalaskututka.",
    "dash.searchBtn": "Selaa Asuntoja",
    "dash.manageRadars": "Hallitse Tutkia",
    "dash.statListings": "Seurattavat Kohteet",
    "dash.statDrops": "Havaittua Hintalaskua",
    "dash.statRadars": "Automaattiset Tutkat",
    "dash.statFavorites": "Omat Suosikit",
    "dash.unitListings": "kohdetta",
    "dash.unitDrops": "löytöä",
    "dash.unitActive": "aktiivista",
    "dash.unitSaved": "tallennettu",
    "dash.citySelectSuffix": "Alueen kohteet",
    "dash.cityJumpBtn": "Avaa Kohteet",
    "dash.radarCompleted": "Tutkahaku Suoritettu Onnistuneesti",
    "dash.topBargains": "Päivän Parhaat Löydöt & Korkeat Pisteet",
    "dash.viewAll": "Näytä kaikki",
    "dash.priceDrops": "Viimeisimmät Hintalaskut",
    "dash.viewAllDrops": "Näytä kaikki hintalaskut",
    "dash.activeRadars": "Aktiiviset Hakututkat",
    "dash.noRadars": "Ei vielä tallennettuja tutkia. Voit tallentaa hakukriteerisi tutkaksi hakusivulta.",
    "dash.manage": "Hallitse →",
    "dash.minScore": "Min Pisteet",
    "dash.running": "Haetaan...",
    "dash.runNow": "Suorita Haku",
    "dash.compareDock": "Vertailulista",
    "dash.compareNow": "Vertaile →",
    "dash.personalRadar": "Henkilökohtainen Datatutka",
    "dash.personalRadarDesc": "Kaikki hakuehtosi ja hintalaskuhälytyksesi päivittyvät automaattisesti taustalla.",

    // Property Card & Details
    "prop.built": "Rakennettu",
    "prop.maintenance": "Hoitovastike",
    "prop.sqmPrice": "€/m²",
    "prop.rooms": "Huoneita",
    "prop.floor": "Kerros",
    "prop.energyClass": "Energialuokka",
    "prop.balcony": "Parveke",
    "prop.sauna": "Sauna",
    "prop.elevator": "Hissi",
    "prop.viewOnEtuovi": "Katso Etuovi.comissa",
    "prop.priceHistory": "Hintahistoria & Laskut",
    "prop.noPriceHistory": "Ei vielä kirjattuja hintalaskuja. Hinta on pysynyt alkuperäisessä pyynnissä.",
    "prop.askPrice": "Velaton Hinta",
    "prop.livingArea": "Asuinpinta-ala",
    "prop.details": "Kohteen Tiedot",

    // Search & Filters
    "search.title": "Asuntohaku",
    "search.results": "kohdetta löytyi",
    "search.filters": "Tarkennettu Haku",
    "search.clearAll": "Tyhjennä valinnat",
    "search.keywordPlaceholder": "Hae osoitteella, kaupunginosalla...",
    "search.city": "Kaupunki / Kunta",
    "search.district": "Helsingin kaupunginosat",
    "search.price": "Hintahaarukka (€)",
    "search.area": "Pinta-ala (m²)",
    "search.buildYear": "Rakennusvuosi",
    "search.maxMaintenance": "Maks. Hoitovastike (€/kk)",
    "search.amenities": "Varustelu & Ominaisuudet",
    "search.sortBy": "Järjestä",
    "search.sortNewest": "Uusimmat ensin",
    "search.sortOldest": "Vanhimmat ensin",
    "search.sortPriceLow": "Hinta: Edullisin ensin",
    "search.sortPriceHigh": "Hinta: Kallein ensin",
    "search.sortSqmLow": "Neliöhinta: Alhaisin ensin",
    "search.sortSqmHigh": "Neliöhinta: Korkein ensin",
    "search.sortAreaHigh": "Pinta-ala: Suurin ensin",
    "search.sortScoreHigh": "Tekoälypisteet: Korkein ensin",
    "search.saveRadar": "Tallenna Tutkaksi",
    "search.noResults": "Hakuehdoillasi ei löytynyt kohteita. Kokeile laajentaa hinta- tai aluevalintoja.",

    // Common
    "common.loading": "Ladataan live-tietoja Etuovesta...",
    "common.save": "Tallenna",
    "common.cancel": "Peruuta",
    "common.delete": "Poista",
    "common.close": "Sulje"
  },

  ru: {
    // Nav
    "nav.dashboard": "Панель управления",
    "nav.explore": "Поиск недвижимости",
    "nav.favorites": "Избранное",
    "nav.compare": "Сравнить",
    "nav.liveFeed": "Etuovi Live",
    "nav.radarActive": "Радар активен",
    "nav.notifications": "Уведомления",
    "nav.markAllRead": "Прочитать все",
    "nav.noNotifications": "Нет новых уведомлений. Здесь появятся снижения цен и совпадения радара.",
    "nav.viewAll": "Все уведомления →",

    // Dashboard
    "dash.welcome": "Добро пожаловать, Лина! 👋",
    "dash.welcomeSub": "Панель мониторинга рынка недвижимости Финляндии и радар снижения цен.",
    "dash.searchBtn": "Искать квартиры",
    "dash.manageRadars": "Управление радарами",
    "dash.statListings": "Объектов в базе",
    "dash.statDrops": "Снижений цен",
    "dash.statRadars": "Активных радаров",
    "dash.statFavorites": "В избранном",
    "dash.unitListings": "объектов",
    "dash.unitDrops": "скидок",
    "dash.unitActive": "активно",
    "dash.unitSaved": "сохранено",
    "dash.citySelectSuffix": "Объекты в регионе",
    "dash.cityJumpBtn": "Перейти к объектам",
    "dash.radarCompleted": "Поиск радара успешно завершен",
    "dash.topBargains": "Лучшие предложения и высокий рейтинг",
    "dash.viewAll": "Смотреть все",
    "dash.priceDrops": "Недавние снижения цен",
    "dash.viewAllDrops": "Все скидки",
    "dash.activeRadars": "Активные радары поиска",
    "dash.noRadars": "Пока нет сохраненных радаров. Вы можете сохранить фильтры на странице поиска.",
    "dash.manage": "Управление →",
    "dash.minScore": "Мин. балл",
    "dash.running": "Поиск...",
    "dash.runNow": "Запустить радар",
    "dash.compareDock": "Список сравнения",
    "dash.compareNow": "Сравнить →",
    "dash.personalRadar": "Персональный радар данных",
    "dash.personalRadarDesc": "Все ваши критерии поиска и уведомления о снижении цен отслеживаются в реальном времени.",

    // Property Card & Details
    "prop.built": "Год постройки",
    "prop.maintenance": "Коммунальные (Hoitovastike)",
    "prop.sqmPrice": "€/м²",
    "prop.rooms": "Комнат",
    "prop.floor": "Этаж",
    "prop.energyClass": "Класс энергоэффективности",
    "prop.balcony": "Балкон",
    "prop.sauna": "Сауна",
    "prop.elevator": "Лифт",
    "prop.viewOnEtuovi": "Открыть на Etuovi.com",
    "prop.priceHistory": "История изменения цен",
    "prop.noPriceHistory": "Снижений цен пока не зафиксировано. Цена на первоначальном уровне.",
    "prop.askPrice": "Цена объекта",
    "prop.livingArea": "Жилая площадь",
    "prop.details": "Детали объекта",

    // Search & Filters
    "search.title": "Поиск квартир",
    "search.results": "объектов найдено",
    "search.filters": "Фильтры",
    "search.clearAll": "Сбросить",
    "search.keywordPlaceholder": "Поиск по адресу, району, улице...",
    "search.city": "Город / Муниципалитет",
    "search.district": "Районы Хельсинки",
    "search.price": "Диапазон цен (€)",
    "search.area": "Площадь (м²)",
    "search.buildYear": "Год постройки",
    "search.maxMaintenance": "Макс. квартплата (€/мес)",
    "search.amenities": "Удобства",
    "search.sortBy": "Сортировка",
    "search.sortNewest": "Сначала новые",
    "search.sortOldest": "Сначала старые",
    "search.sortPriceLow": "Сначала дешевые",
    "search.sortPriceHigh": "Сначала дорогие",
    "search.sortSqmLow": "Цена за м²: сначала низкая",
    "search.sortSqmHigh": "Цена за м²: сначала высокая",
    "search.sortAreaHigh": "Площадь: сначала большие",
    "search.sortScoreHigh": "Рейтинг ИИ: сначала высокий",
    "search.saveRadar": "Сохранить как радар",
    "search.noResults": "По вашим критериям объектов не найдено. Попробуйте расширить диапазон цен или районов.",

    // Common
    "common.loading": "Загрузка данных из Etuovi...",
    "common.save": "Сохранить",
    "common.cancel": "Отмена",
    "common.delete": "Удалить",
    "common.close": "Закрыть"
  },

  tr: {
    // Nav
    "nav.dashboard": "Kontrol Paneli",
    "nav.explore": "İlan Ara",
    "nav.favorites": "Favorilerim",
    "nav.compare": "Karşılaştır",
    "nav.liveFeed": "Etuovi Canlı",
    "nav.radarActive": "Radar Aktif",
    "nav.notifications": "Canlı Bildirimler",
    "nav.markAllRead": "Tümünü okundu yap",
    "nav.noNotifications": "Henüz bildirim yok. Fiyat düşüşleri ve radar eşleşmeleri burada görünecek.",
    "nav.viewAll": "Tüm bildirimleri gör →",

    // Dashboard
    "dash.welcome": "Tekrar hoş geldin, Lina! 👋",
    "dash.welcomeSub": "Canlı Etuovi emlak piyasası izleme ve fiyat düşüş tespit kontrol paneliniz.",
    "dash.searchBtn": "İlanları İncele",
    "dash.manageRadars": "Radarları Yönet",
    "dash.statListings": "İzlenen İlan Havuzu",
    "dash.statDrops": "Yakalanan Fiyat Düşüşü",
    "dash.statRadars": "Otomatik Radar Araması",
    "dash.statFavorites": "Favori Evlerim",
    "dash.unitListings": "ilan",
    "dash.unitDrops": "fırsat",
    "dash.unitActive": "aktif",
    "dash.unitSaved": "kayıtlı",
    "dash.citySelectSuffix": "Bölgesindeki İlanlar",
    "dash.cityJumpBtn": "İlanlara Git",
    "dash.radarCompleted": "Radar Taraması Başarıyla Tamamlandı",
    "dash.topBargains": "Günün En İyi Fırsatları & Yüksek Skorlu Evler",
    "dash.viewAll": "Tümünü gör",
    "dash.priceDrops": "Son Fiyat İndirimleri",
    "dash.viewAllDrops": "Tüm indirimleri gör",
    "dash.activeRadars": "Aktif Arama Radarları",
    "dash.noRadars": "Henüz kayıtlı radarınız yok. İlan arama sayfasından filtrelerinizi radar olarak kaydedebilirsiniz.",
    "dash.manage": "Yönet →",
    "dash.minScore": "Min Skor",
    "dash.running": "Taranıyor...",
    "dash.runNow": "Şimdi Tara",
    "dash.compareDock": "Karşılaştırma Listesi",
    "dash.compareNow": "Kıyasla →",
    "dash.personalRadar": "Kişisel Veri Radarı",
    "dash.personalRadarDesc": "Tüm arama kriterleriniz ve indirim takipleriniz doğrudan bu panel üzerinden otomatik güncellenir.",

    // Property Card & Details
    "prop.built": "Yapım Yılı",
    "prop.maintenance": "Aidat (Hoitovastike)",
    "prop.sqmPrice": "€/m²",
    "prop.rooms": "Oda Sayısı",
    "prop.floor": "Kat",
    "prop.energyClass": "Enerji Sınıfı",
    "prop.balcony": "Balkon",
    "prop.sauna": "Sauna",
    "prop.elevator": "Asansör",
    "prop.viewOnEtuovi": "Etuovi.com üzerinde gör",
    "prop.priceHistory": "Fiyat İndirim Geçmişi",
    "prop.noPriceHistory": "Henüz fiyat düşüşü kaydedilmedi. İlan başlangıç fiyatında duruyor.",
    "prop.askPrice": "Satış Fiyatı",
    "prop.livingArea": "Kullanım Alanı",
    "prop.details": "İlan Detayları",

    // Search & Filters
    "search.title": "İlan Arama & Keşif",
    "search.results": "ilan bulundu",
    "search.filters": "Gelişmiş Filtreler",
    "search.clearAll": "Tümünü Temizle",
    "search.keywordPlaceholder": "Adres, semt veya sokak ara...",
    "search.city": "Şehir / Belediye",
    "search.district": "Helsinki Semtleri",
    "search.price": "Fiyat Aralığı (€)",
    "search.area": "Metrekare (m²)",
    "search.buildYear": "Bina Yapım Yılı",
    "search.maxMaintenance": "Maksimum Aidat (€/ay)",
    "search.amenities": "Özellikler & Donanım",
    "search.sortBy": "Sıralama",
    "search.sortNewest": "En yeni ilanlar",
    "search.sortOldest": "En eski ilanlar",
    "search.sortPriceLow": "Fiyat: En düşükten yükseğe",
    "search.sortPriceHigh": "Fiyat: En yüksekten düşüğe",
    "search.sortSqmLow": "m² fiyatı: En düşükten yükseğe",
    "search.sortSqmHigh": "m² fiyatı: En yüksekten düşüğe",
    "search.sortAreaHigh": "Metrekare: En büyükten küçüğe",
    "search.sortScoreHigh": "Yapay Zeka Skoru: En yüksekten düşüğe",
    "search.saveRadar": "Radar Olarak Kaydet",
    "search.noResults": "Filtre kriterlerinize uyan ilan bulunamadı. Fiyat veya bölge aralığını genişletmeyi deneyin.",

    // Common
    "common.loading": "Etuovi canlı verileri yükleniyor...",
    "common.save": "Kaydet",
    "common.cancel": "İptal",
    "common.delete": "Sil",
    "common.close": "Kapat"
  }
};

export type TranslationKey = keyof typeof translations.en;

export interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  currentLanguageOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem("kotiscout_lang") as SupportedLanguage;
    if (saved && ["en", "fi", "ru", "tr"].includes(saved)) {
      return saved;
    }
    return "en"; // Default primary language: English
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("kotiscout_lang", lang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    const text = dict[key] || translations.en[key] || fallback || (key as string);
    return text;
  };

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
};
