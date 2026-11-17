import { Injectable } from '@angular/core';

export type Lang = 'he' | 'en';
const STORAGE_KEY = 'seman-lang';

type Dict = Record<string, string>;

/**
 * תרגום הכיתובים הקבועים של האתר (עברית/אנגלית).
 * תוכן שמוזן בניהול (שם עסק, תיאור, כתובת, שעות…) אינו מתורגם ומוצג כפי שהוזן.
 * הוספת כיתוב: מוסיפים מפתח בשני המילונים ומשתמשים ב-i18n.t('key') בתבנית.
 */
const HE: Dict = {
  siteTitle: 'סמן | מסמנים את העסק שלך במפה',
  siteDescription: 'עמוד אינטרנט אישי, פשוט ומקצועי לכל עסק קטן ולעצמאי.',
  skipToContent: 'דלג לתוכן הראשי',
  switchTo: 'English',
  switchToShort: 'EN',
  switchLabel: 'Switch to English',
  loading: 'טוענת…',
  semanSite: 'לאתר סמן',
  poweredBy: 'פותח בעזרת סמן',
  poweredTag: 'מסמנים את העסק שלך על המפה',
  poweredFull: 'פותח בעזרת סמן – מסמנים את העסק שלך על המפה',

  // נגישות
  a11yButton: 'תפריט נגישות',
  a11yTitle: 'נגישות',
  a11yClose: 'סגירה',
  a11yTextSize: 'גודל טקסט',
  a11yBigger: 'הגדלה',
  a11ySmaller: 'הקטנה',
  a11yContrast: 'ניגודיות גבוהה',
  a11yGrayscale: 'גווני אפור',
  a11yLinks: 'הדגשת קישורים',
  a11yFont: 'גופן קריא',
  a11yMotion: 'הפסקת אנימציות',
  a11yReset: 'איפוס הגדרות',
  a11yStatement: 'הצהרת נגישות',
  a11yStatementTitle: 'הצהרת נגישות',
  a11yBack: 'חזרה לאתר',
  a11yStatementBody1: 'אנחנו בסמן רוצים שכל אדם יוכל להשתמש באתר בנוחות. האתר כולל תפריט נגישות (בפינת המסך) שמאפשר להגדיל טקסט, להגביר ניגודיות, לעבור לגווני אפור, להדגיש קישורים, לעבור לגופן קריא ולהפסיק אנימציות.',
  a11yStatementBody2: 'אנחנו פועלים להתאים את האתר להנחיות הנגישות WCAG 2.1 ברמה AA, ובין היתר: ניווט מלא במקלדת, כותרות וסימון מבנה, טקסט חלופי לתמונות ותוויות לשדות הטפסים. ייתכן שחלקים מהאתר או תוכן שהוזן על ידי בעלי העסקים עדיין אינם מונגשים באופן מלא.',
  a11yStatementBody3: 'נתקלת בבעיית נגישות או יש לך הצעה לשיפור? נשמח לשמוע ולתקן.',
  a11yStatementContact: 'ליצירת קשר',
  a11yStatementUpdated: 'ההצהרה עודכנה בנובמבר 2026.',

  // דף עסק
  navContact: 'יצירת קשר',
  navGallery: 'גלריה',
  navMessage: 'השאירו לנו הודעה',
  navReviews: 'המלצות',
  navTopLabel: 'ניווט בעמוד העסק',
  aboutTitle: 'קצת עלינו',
  navAbout: 'קצת עלינו',
  aboutWhy: 'ולמה דווקא אצלנו?',
  toContactBtn: 'דברו איתנו',
  toMessageBtn: 'השאירו הודעה',
  hoursTitle: 'שעות פעילות',
  contactEyebrow: 'נשמח לעמוד לשירותכם',
  contactTitle: 'דברו איתנו',
  contactSub: 'כל דרכי יצירת הקשר עם {name} במקום אחד',
  address: 'כתובת',
  addressHint: 'לניווט במפה ←',
  phone: 'טלפון',
  phoneHint: 'לחיוג ←',
  email: 'דוא״ל',
  copyEmailAria: 'העתקת כתובת המייל',
  copyEmailTitle: 'העתקת מייל',
  sendEmail: 'שליחת מייל',
  whatsappSend: '◉ שליחת הודעת WhatsApp',
  whatsappNone: 'WhatsApp לא זמין בעסק זה. אפשר להתקשר או לשלוח מייל.',
  whatsappNoneShort: 'WhatsApp אינו זמין בעסק זה.',
  smsSend: '✉ שליחת SMS',
  shareBusiness: '↗ שיתוף העסק',
  galleryTitle: 'קצת מהעסק שלנו',
  photoOf: 'תמונה של {name}',
  logoOf: 'הלוגו של {name}',
  questionTitle: 'יש לכם שאלה?',
  questionSub: 'השאירו פרטים ונחזור אליכם בהקדם',
  fullName: 'שם מלא',
  fullNamePh: 'איך קוראים לכם?',
  phoneLabel: 'טלפון',
  phonePh: 'מספר טלפון לחזרה',
  emailLabel: 'כתובת דוא״ל',
  emailPh: 'כתובת המייל שלכם',
  messageLabel: 'תוכן ההודעה',
  messagePh: 'כתבו לנו במה נוכל לעזור...',
  submit: 'שליחת פרטים',
  sending: 'שולחת…',
  notToFill: 'לא למילוי',
  bizFormNote: 'הפנייה תישלח לכתובת הדוא״ל של העסק.',
  bizSentOk: 'הפנייה נשלחה בהצלחה! העסק יחזור אליכם בהקדם.',
  sendFail: 'לא הצלחנו לשלוח את הפנייה. נסו שוב מאוחר יותר.',
  sendNotConfigured: 'שליחת הפנייה עדיין לא הוגדרה בענן.',
  reviewsEyebrow: 'ממליצים על {name}',
  reviewsTitle: 'מה הלקוחות שלנו אומרים?',
  copyright: '© כל הזכויות שמורות {name}',
  notFoundTitle: 'העמוד לא נמצא',
  notFoundText: 'ייתכן שהקישור שגוי או שהעמוד אינו מפורסם.',
  backToSeman: 'חזרה לאתר סמן',
  loadingBusiness: 'טוענת את פרטי העסק…',
  moreInNeighborhood: 'עוד עסקים ב{name}',
  inNeighborhood: 'בשכונת {name}',
  emailCopied: 'כתובת המייל הועתקה.',
  copyEmailPrompt: 'העתיקו את כתובת המייל:',
  detailsCopied: 'פרטי העסק הועתקו. אפשר להדביק אותם בהודעה.',
  copyDetailsPrompt: 'העתיקו את פרטי העסק:',
  shareTelLabel: 'טלפון',
  shareEmailLabel: 'מייל',
  shareSiteLabel: 'אתר',
  shareAddressLabel: 'כתובת',
  shareDefaultTitle: 'פרטי עסק',

  // דף הבית (כיתובים קבועים)
  homePhone: 'טלפון',
  homePhoneHint: 'לחיוג ישיר',
  homeEmail: 'דוא״ל',
  homeEmailHint: 'כתבו לנו',
  homeWaOk: '● זמין לפנייה – מספר הוגדר',
  homeWaNo: '● לא זמין – לא הוגדר מספר',
  homeNavLabel: 'ניווט ראשי',
  homeFormNamePh: 'איך קוראים לכם?',
  homeBusinessName: 'שם העסק',
  homeBusinessNamePh: 'שם העסק',
  homePhoneBack: 'טלפון לחזרה',
  homeAbout: 'ספרו לנו קצת על העסק',
  homeAboutPh: 'במה נוכל לעזור?',
  homeSendFail: 'שליחת המייל עדיין לא הוגדרה. יש להשלים את חיבור שירות המייל בענן.',
  homeGenericFail: 'אירעה שגיאה בשליחת הפנייה.',
  homeBizLoadFail: 'לא הצלחנו לטעון כרגע את העסקים. כדאי לרענן את העמוד בעוד רגע.',
  homeBizOf: 'לצפייה בעמוד העסק',
  homeFooterLinks: 'קישורים בתחתית האתר',
  homeAudienceLabel: 'למי סמן מיועד',
  homeNeighborhoods: 'שכונות בסמן',
  homeNeighborhoodsSub: 'כל העסקים של השכונה במקום אחד',

  // דף שכונה
  nbAll: 'הכל',
  nbFilterLabel: 'סינון לפי קטגוריה',
  nbBusinessesCount: '{n} עסקים בשכונה',
  nbBusinessesCountOne: 'עסק אחד בשכונה',
  nbEmpty: 'עדיין אין עסקים להצגה בשכונה זו.',
  nbEmptyCategory: 'אין עסקים בקטגוריה זו.',
  nbToBusiness: 'לעמוד העסק',
  nbLoading: 'טוענת את השכונה…',
  nbNotFoundTitle: 'השכונה לא נמצאה',
  nbNotFoundText: 'ייתכן שהקישור שגוי או שהעמוד אינו מפורסם.',
  nbWelcome: 'כל העסקים של השכונה במקום אחד',
  nbLogoOf: 'הלוגו של שכונת {name}',
  nbSemanLink: 'רוצים עמוד לעסק שלכם? לאתר סמן ←',
  nbCategoryHeading: 'קטגוריות',
};

const EN: Dict = {
  siteTitle: 'Seman | Put your business on the map',
  siteDescription: 'A simple, professional personal web page for every small business and freelancer.',
  skipToContent: 'Skip to main content',
  switchTo: 'עברית',
  switchToShort: 'עב',
  switchLabel: 'מעבר לעברית',
  loading: 'Loading…',
  semanSite: 'Seman website',
  poweredBy: 'Built with Seman',
  poweredTag: 'Put your business on the map',
  poweredFull: 'Built with Seman – put your business on the map',

  a11yButton: 'Accessibility menu',
  a11yTitle: 'Accessibility',
  a11yClose: 'Close',
  a11yTextSize: 'Text size',
  a11yBigger: 'Larger',
  a11ySmaller: 'Smaller',
  a11yContrast: 'High contrast',
  a11yGrayscale: 'Grayscale',
  a11yLinks: 'Highlight links',
  a11yFont: 'Readable font',
  a11yMotion: 'Stop animations',
  a11yReset: 'Reset settings',
  a11yStatement: 'Accessibility statement',
  a11yStatementTitle: 'Accessibility statement',
  a11yBack: 'Back to the site',
  a11yStatementBody1: 'At Seman we want everyone to be able to use the site comfortably. The site includes an accessibility menu (in the corner of the screen) that lets you enlarge text, increase contrast, switch to grayscale, highlight links, use a readable font and stop animations.',
  a11yStatementBody2: 'We are working to align the site with the WCAG 2.1 level AA guidelines, including full keyboard navigation, headings and page structure, alternative text for images and labels for form fields. Some parts of the site, or content entered by business owners, may not yet be fully accessible.',
  a11yStatementBody3: 'Did you run into an accessibility problem, or do you have a suggestion? We would be glad to hear it and fix it.',
  a11yStatementContact: 'Contact',
  a11yStatementUpdated: 'This statement was last updated in November 2026.',

  navContact: 'Contact',
  navGallery: 'Gallery',
  navMessage: 'Send a message',
  navReviews: 'Reviews',
  navTopLabel: 'Business page navigation',
  aboutTitle: 'About us',
  navAbout: 'About us',
  aboutWhy: 'And why choose us?',
  toContactBtn: 'Talk to us',
  toMessageBtn: 'Leave a message',
  hoursTitle: 'Opening hours',
  contactEyebrow: 'We are happy to help',
  contactTitle: 'Talk to us',
  contactSub: 'All the ways to contact {name} in one place',
  address: 'Address',
  addressHint: 'Open in maps →',
  phone: 'Phone',
  phoneHint: 'Tap to call →',
  email: 'Email',
  copyEmailAria: 'Copy the email address',
  copyEmailTitle: 'Copy email',
  sendEmail: 'Send an email',
  whatsappSend: '◉ Send a WhatsApp message',
  whatsappNone: 'WhatsApp is not available for this business. You can call or send an email.',
  whatsappNoneShort: 'WhatsApp is not available for this business.',
  smsSend: '✉ Send an SMS',
  shareBusiness: '↗ Share this business',
  galleryTitle: 'A glimpse of our business',
  photoOf: 'Photo of {name}',
  logoOf: 'Logo of {name}',
  questionTitle: 'Have a question?',
  questionSub: 'Leave your details and we will get back to you soon',
  fullName: 'Full name',
  fullNamePh: 'What is your name?',
  phoneLabel: 'Phone',
  phonePh: 'A phone number to reach you',
  emailLabel: 'Email address',
  emailPh: 'Your email address',
  messageLabel: 'Message',
  messagePh: 'Tell us how we can help...',
  submit: 'Send',
  sending: 'Sending…',
  notToFill: 'Leave empty',
  bizFormNote: 'Your message will be sent to the business email address.',
  bizSentOk: 'Your message was sent! The business will get back to you soon.',
  sendFail: 'We could not send your message. Please try again later.',
  sendNotConfigured: 'Sending messages is not set up yet.',
  reviewsEyebrow: 'Recommendations for {name}',
  reviewsTitle: 'What our customers say',
  copyright: '© All rights reserved to {name}',
  notFoundTitle: 'Page not found',
  notFoundText: 'The link may be wrong or the page is not published.',
  backToSeman: 'Back to Seman',
  loadingBusiness: 'Loading business details…',
  moreInNeighborhood: 'More businesses in {name}',
  inNeighborhood: 'In the {name} neighborhood',
  emailCopied: 'The email address was copied.',
  copyEmailPrompt: 'Copy the email address:',
  detailsCopied: 'The business details were copied. You can paste them into a message.',
  copyDetailsPrompt: 'Copy the business details:',
  shareTelLabel: 'Phone',
  shareEmailLabel: 'Email',
  shareSiteLabel: 'Website',
  shareAddressLabel: 'Address',
  shareDefaultTitle: 'Business details',

  homePhone: 'Phone',
  homePhoneHint: 'Call directly',
  homeEmail: 'Email',
  homeEmailHint: 'Write to us',
  homeWaOk: '● Available – number configured',
  homeWaNo: '● Not available – no number configured',
  homeNavLabel: 'Main navigation',
  homeFormNamePh: 'What is your name?',
  homeBusinessName: 'Business name',
  homeBusinessNamePh: 'Business name',
  homePhoneBack: 'Phone number',
  homeAbout: 'Tell us a little about your business',
  homeAboutPh: 'How can we help?',
  homeSendFail: 'Sending email is not set up yet. The email service connection needs to be completed.',
  homeGenericFail: 'An error occurred while sending your message.',
  homeBizLoadFail: 'We could not load the businesses right now. Please refresh the page in a moment.',
  homeBizOf: 'View business page',
  homeFooterLinks: 'Footer links',
  homeAudienceLabel: 'Who Seman is for',
  homeNeighborhoods: 'Seman neighborhoods',
  homeNeighborhoodsSub: 'All the businesses of a neighborhood in one place',

  nbAll: 'All',
  nbFilterLabel: 'Filter by category',
  nbBusinessesCount: '{n} businesses in the neighborhood',
  nbBusinessesCountOne: '1 business in the neighborhood',
  nbEmpty: 'There are no businesses to show in this neighborhood yet.',
  nbEmptyCategory: 'There are no businesses in this category.',
  nbToBusiness: 'View business page',
  nbLoading: 'Loading the neighborhood…',
  nbNotFoundTitle: 'Neighborhood not found',
  nbNotFoundText: 'The link may be wrong or the page is not published.',
  nbWelcome: 'All the businesses of the neighborhood in one place',
  nbLogoOf: 'Logo of the {name} neighborhood',
  nbSemanLink: 'Want a page for your business? Visit Seman →',
  nbCategoryHeading: 'Categories',
};

const DICTS: Record<Lang, Dict> = { he: HE, en: EN };

@Injectable({ providedIn: 'root' })
export class I18nService {
  lang: Lang = 'he';
  private listeners: Array<() => void> = [];

  constructor() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'he') this.lang = saved;
    } catch { /* אחסון חסום: נשארים בעברית */ }
    this.applyToDocument();
  }

  get isEnglish(): boolean { return this.lang === 'en'; }
  get dir(): 'rtl' | 'ltr' { return this.lang === 'he' ? 'rtl' : 'ltr'; }

  t(key: string, params?: Record<string, string | number>): string {
    let text = DICTS[this.lang][key] ?? DICTS.he[key] ?? key;
    if (params) for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value));
    return text;
  }

  toggle(): void { this.set(this.lang === 'he' ? 'en' : 'he'); }

  set(lang: Lang): void {
    if (lang === this.lang) return;
    this.lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* לא קריטי */ }
    this.applyToDocument();
    this.listeners.forEach(listener => listener());
  }

  /** רישום להאזנה לשינוי שפה (למשל לעדכון כותרת הדף). */
  onChange(listener: () => void): void { this.listeners.push(listener); }

  private applyToDocument(): void {
    document.documentElement.lang = this.lang;
    document.documentElement.dir = this.dir;
  }
}
