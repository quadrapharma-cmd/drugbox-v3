// ============================================================
// Drugbox i18n — translation dictionary (English + Arabic)
// Every user-facing string lives here under a stable key.
// ============================================================

export type Lang = 'en' | 'ar'

export const translations = {
  // --- Auth ---
  'auth.welcomeBack': { en: 'Welcome back', ar: 'مرحبًا بعودتك' },
  'auth.signinSub': { en: 'Sign in to your Drugbox account', ar: 'سجّل الدخول إلى حسابك في Drugbox' },
  'auth.email': { en: 'Email', ar: 'البريد الإلكتروني' },
  'auth.password': { en: 'Password', ar: 'كلمة المرور' },
  'auth.signIn': { en: 'Sign In', ar: 'تسجيل الدخول' },
  'auth.signingIn': { en: 'Signing in…', ar: 'جاري تسجيل الدخول…' },
  'auth.noAccount': { en: "Don't have an account?", ar: 'ليس لديك حساب؟' },
  'auth.createOne': { en: 'Create one', ar: 'أنشئ حسابًا' },
  'auth.demoAccount': { en: 'Demo account', ar: 'حساب تجريبي' },
  'auth.heroTitle': { en: 'The professional network for the pharmaceutical industry', ar: 'الشبكة المهنية لصناعة الأدوية' },
  'auth.heroText': { en: 'Connect with manufacturers, suppliers, and regulatory experts across Egypt, the GCC, and Africa.', ar: 'تواصل مع المصنّعين والموردين وخبراء الشؤون التنظيمية في مصر والخليج وأفريقيا.' },
  'auth.feat1': { en: 'Source APIs, excipients, and equipment', ar: 'مصادر المواد الفعّالة والسواغات والمعدات' },
  'auth.feat2': { en: 'Build verified professional connections', ar: 'ابنِ علاقات مهنية موثّقة' },
  'auth.feat3': { en: 'Stay ahead on regulatory developments', ar: 'ابقَ في صدارة التطورات التنظيمية' },
  'auth.professionals': { en: 'Professionals', ar: 'محترف' },
  'auth.countries': { en: 'Countries', ar: 'دولة' },
  'auth.categories': { en: 'Categories', ar: 'فئة' },
  'auth.createAccount': { en: 'Create Account', ar: 'إنشاء حساب' },
  'auth.creating': { en: 'Creating…', ar: 'جاري الإنشاء…' },
  'auth.joinTitle': { en: 'Join the pharmaceutical professional network', ar: 'انضم إلى الشبكة المهنية لصناعة الأدوية' },
  'auth.fullName': { en: 'Full name', ar: 'الاسم الكامل' },
  'auth.headline': { en: 'Headline', ar: 'المسمى الوظيفي' },
  'auth.company': { en: 'Company', ar: 'الشركة' },
  'auth.agreeTo': { en: 'I agree to the', ar: 'أوافق على' },
  'auth.userAgreement': { en: 'User Agreement', ar: 'اتفاقية المستخدم' },
  'auth.haveAccount': { en: 'Already have an account?', ar: 'لديك حساب بالفعل؟' },
  'auth.signInLink': { en: 'Sign in', ar: 'تسجيل الدخول' },

  // --- Navigation ---
  'nav.main': { en: 'Main', ar: 'الرئيسية' },
  'nav.discover': { en: 'Discover', ar: 'استكشف' },
  'nav.pages': { en: 'Pages', ar: 'الصفحات' },
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.marketplace': { en: 'Marketplace', ar: 'السوق' },
  'nav.messages': { en: 'Messages', ar: 'الرسائل' },
  'nav.myNetwork': { en: 'My Network', ar: 'شبكتي' },
  'nav.groups': { en: 'Groups', ar: 'المجموعات' },
  'nav.jobs': { en: 'Jobs', ar: 'الوظائف' },
  'nav.myProfile': { en: 'My Profile', ar: 'ملفي الشخصي' },
  'nav.createCompany': { en: 'Create Company Page', ar: 'إنشاء صفحة شركة' },
  'nav.notBuilt': { en: 'Not built yet', ar: 'غير متاح بعد' },
  'nav.signOut': { en: 'Sign Out', ar: 'تسجيل الخروج' },

  // --- Feed ---
  'feed.composerPlaceholder': { en: 'Share an update, ask a question…', ar: 'شارك تحديثًا أو اطرح سؤالًا…' },
  'feed.post': { en: 'Post', ar: 'نشر' },
  'feed.posting': { en: 'Posting…', ar: 'جاري النشر…' },
  'feed.like': { en: 'Like', ar: 'إعجاب' },
  'feed.comment': { en: 'Comment', ar: 'تعليق' },
  'feed.reactions': { en: 'reactions', ar: 'تفاعل' },
  'feed.comments': { en: 'comments', ar: 'تعليق' },
  'feed.addComment': { en: 'Add a comment…', ar: 'أضف تعليقًا…' },
  'feed.send': { en: 'Send', ar: 'إرسال' },
  'feed.empty': { en: 'No posts yet. Be the first to share something!', ar: 'لا توجد منشورات بعد. كن أول من يشارك!' },
  'feed.marketToday': { en: 'Market Today', ar: 'السوق اليوم' },
  'feed.activeSupply': { en: 'Active Supply', ar: 'عروض نشطة' },
  'feed.openDemand': { en: 'Open Demand', ar: 'طلبات مفتوحة' },
  'feed.openJobs': { en: 'Open Jobs', ar: 'وظائف شاغرة' },
  'feed.cmoListings': { en: 'CMO Listings', ar: 'إعلانات التصنيع' },

  // --- Categories ---
  'cat.general': { en: 'General', ar: 'عام' },
  'cat.regulatory': { en: 'Regulatory', ar: 'تنظيمي' },
  'cat.market': { en: 'Market', ar: 'السوق' },
  'cat.innovation': { en: 'Innovation', ar: 'ابتكار' },
  'cat.job': { en: 'Job', ar: 'وظيفة' },

  // --- Common ---
  'common.member': { en: 'Member', ar: 'عضو' },
  'common.cancel': { en: 'Cancel', ar: 'إلغاء' },
  'common.save': { en: 'Save', ar: 'حفظ' },
  'common.delete': { en: 'Delete', ar: 'حذف' },
  'common.confirm': { en: 'Confirm', ar: 'تأكيد' },
} as const

export type TranslationKey = keyof typeof translations
