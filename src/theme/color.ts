// src/constants/colors.ts

const PALETTE = {
    // Senin verdiğin Bebek Mavisi tonları
    babyBlueLight: "#89CFF0", // En açık, dark mod tint'i için ideal
    babyBlueMain: "#38AEE6",  // Ana marka rengimiz (Hem light hem darkta okunaklı)
    babyBlueDeep: "#1B99D4",  // Buton hover/basılma durumları için
    babyBlueDark: "#0B415A",  // Gradient bitişleri veya çok koyu mavi detaylar için

    // Tamamlayıcı "Sade" Zemin ve Metin Renkleri (Slate tonları)
    slateBgLight: "#F8FAFC",  // Çok ferah, hafif grimsi beyaz (Zemin)
    slateBgDark: "#0F172A",   // Koyu lacivert-gri (Dark mode zemin - bebek mavisiyle harika uyar)
    cardDark: "#1E293B",      // Dark mode kart rengi (Zeminden bir tık ayrışır)

    // Aksan ve Durum Renkleri (Maviyle uyumlu, göz yormayan pastel tonlar)
    success: "#10B981",       // Tatlı bir zümrüt yeşili
    error: "#EF4444",         // Temiz, okunabilir bir kırmızı
    white: "#FFFFFF",
};

const light = {
    // --- METİN & İKON HİYERARŞİSİ ---
    // Saf siyah yerine koyu slate kullanıyoruz. Bebek mavisiyle saf siyah çok çiğ durur.
    primary: "#0F172A",         // %100 - Ana metinler ve Başlıklar
    secondary: "#475569",       // %60  - Alt açıklamalar, subtitle
    tertiary: "#94A3B8",        // %30  - Placeholder, disable iconlar
    quaternary: "#E2E8F0",
    cute: "#3B82F6",     // Blue-500

    // --- ZEMİN RENKLERİ ---
    background: PALETTE.slateBgLight, // #F8FAFC - Ferah aydınlık zemin
    card: PALETTE.white,              // Kartların içi bembeyaz

    // --- MARKA & AKSİYON ---
    tint: PALETTE.babyBlueMain,       // #38AEE6 - Butonlar, Linkler, Aktif tab ikonları
    success: PALETTE.success,         // Onay durumları
    error: PALETTE.error,             // Hata durumları

    // --- GRADIENTLER (Bebek mavisinin içindeki geçişler) ---
    linear1: PALETTE.babyBlueLight,   // Açık maviden
    linear2: PALETTE.babyBlueMain,    // Ana maviye tatlı bir geçiş

    // Radial genellikle highlight (parlama) efektlerinde kullanılır
    radial1: "#E0F2FE",               // Mavinini çok çok açığı (arkaplan baloncukları için)
    radial2: PALETTE.babyBlueMain,
};

const dark = {
    // --- METİN & İKON HİYERARŞİSİ ---
    // Base renk: #F8FAFC (Kırık Beyaz)
    primary: "#F8FAFC",         // %100 - Ana metinler
    secondary: "#94A3B8",       // %60  - Alt metinler
    tertiary: "#475569",        // %30  - Placeholder, inaktif öğeler
    quaternary: "#334155",      // %18  - Çizgiler, dividerlar

    // --- ZEMİN RENKLERİ ---
    background: PALETTE.slateBgDark,  // #0F172A - Maviyle inanılmaz uyumlu premium koyu zemin
    card: PALETTE.cardDark,           // #1E293B - Kart olduğu belli olsun diye bir tık açık

    // --- MARKA & AKSİYON ---
    tint: PALETTE.babyBlueLight,      // #89CFF0 - Dark modda koyu mavi boğulur, en açık bebek mavisini tint yaptık
    success: "#34D399",               // Dark mod için karanlıkta parlayan yeşil
    error: "#F87171",                 // Dark mod için karanlıkta parlayan kırmızı
    cute: "#3B82F6",     // Blue-500

    // --- GRADIENTLER ---
    linear1: PALETTE.babyBlueMain,    // Ana maviden
    linear2: PALETTE.babyBlueDark,    // Koyu maviye geçiş (Dark mod ruhuna uygun)

    radial1: PALETTE.babyBlueDeep,
    radial2: PALETTE.slateBgDark,     // Siyaha sönümlenen glow efekti
};

// Uygulamanın o anki temasını buradan yönetebilirsin
const COLORS = light;

export default COLORS;