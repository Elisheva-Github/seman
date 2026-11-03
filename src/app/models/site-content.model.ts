import { environment } from '../../environments/environment';

/**
 * תוכן אתר סמן (CMS).
 *
 * עקרון העבודה: הטקסטים המקוריים נשארים בקוד (DEFAULT_CONTENT). במסד הנתונים נשמרים רק
 * שינויים שהמנהלת ערכה (טבלה seman_site_content). לכן "שחזור הטקסט המקורי" הוא פשוט
 * ניקוי השינויים, ופריסת גרסה חדשה של האתר לעולם לא מוחקת עריכות.
 * כלל כללי: שדה שנשאר ריק אינו מוצג באתר.
 */

export type SectionKey =
  | 'header' | 'hero' | 'audience' | 'why' | 'how' | 'examples'
  | 'contact' | 'recommendations' | 'footer';

export interface HeaderContent {
  tagline: string; navWhy: string; navHow: string; navExamples: string;
  navContact: string; navRecommendations: string; cta: string;
}
export interface HeroContent {
  eyebrow: string; title: string; paragraph1: string; paragraph2: string;
  primaryButton: string; secondaryButton: string; mapLabel: string;
  points: { text: string }[];
}
export interface AudienceContent {
  title: string; description: string; items: { icon: string; title: string }[];
}
export interface WhyContent {
  eyebrow: string; title: string; lead: string; subheading: string;
  features: { icon: string; title: string; text: string }[];
}
export interface HowContent {
  eyebrow: string; title: string; lead: string; steps: { title: string; text: string }[];
}
export interface ExamplesContent {
  eyebrow: string; title: string; lead: string; emptyText: string; cardLabel: string; cardButton: string;
}
export interface ContactContent {
  eyebrow: string; title: string; lead: string; phone: string; email: string; whatsapp: string;
  formTitle: string; formSubtitle: string; submitButton: string; formNote: string; successMessage: string;
}
export interface RecommendationsContent { eyebrow: string; title: string; intro: string; }
export interface FooterContent {
  description: string; copyright: string; phone: string; email: string;
  links: { label: string; url: string }[];
}

export interface SiteContent {
  header: HeaderContent; hero: HeroContent; audience: AudienceContent; why: WhyContent;
  how: HowContent; examples: ExamplesContent; contact: ContactContent;
  recommendations: RecommendationsContent; footer: FooterContent;
}
export type SiteVisibility = Record<SectionKey, boolean>;

/** שורה כפי שהיא שמורה בטבלה seman_site_content */
export interface SiteContentRow {
  section_key: SectionKey;
  content: Record<string, unknown>;
  previous_content: Record<string, unknown> | null;
  visible: boolean;
  updated_at?: string;
}

export const DEFAULT_CONTENT: SiteContent = {
  header: {
    tagline: 'מסמנים את העסק שלך במפה',
    navWhy: 'למה סמן',
    navHow: 'איך זה עובד',
    navExamples: 'דוגמאות',
    navContact: 'יצירת קשר',
    navRecommendations: 'ממליצים על סמן',
    cta: 'אני רוצה עמוד לעסק שלי'
  },
  hero: {
    eyebrow: 'נוכחות דיגיטלית לעסקים קטנים ולעצמאיים',
    title: 'סמן!\nמסמנים את העסק שלך במפה.',
    paragraph1: 'אנחנו בסמן יוצרים לעסקים קטנים ולעצמאיים עמוד אינטרנט אישי, פשוט ומקצועי, שמרכז את כל הפרטים החשובים על העסק במקום אחד.',
    paragraph2: 'בלי אתר מורכב, בלי תהליך ארוך ובלי הוצאות מיותרות. פשוט עמוד אחד שמאפשר ללקוחות להכיר אותך, למצוא אותך וליצור איתך קשר.',
    primaryButton: 'אני רוצה עמוד לעסק שלי',
    secondaryButton: 'למה סמן?',
    mapLabel: 'העסק שלך נמצא כאן',
    points: [{ text: 'בלי ידע טכני' }, { text: 'קישור אחד לשיתוף' }, { text: 'מותאם למובייל' }]
  },
  audience: {
    title: '',
    description: '',
    items: [
      { icon: '✂', title: 'בעלי מקצוע' },
      { icon: '▣', title: 'חנויות ועסקים' },
      { icon: '▤', title: 'עצמאיים' },
      { icon: '♡', title: 'נותני שירות' }
    ]
  },
  why: {
    eyebrow: 'למה סמן?',
    title: 'הלקוחות שלך מחפשים אותך.',
    lead: 'אנחנו דואגים שיהיה להם קל למצוא את כל המידע על העסק שלך. במקום לשלוח שוב ושוב מספר טלפון, כתובת ושעות פעילות — פשוט שולחים קישור אחד.',
    subheading: 'כל מה שחשוב ללקוחות שלך במקום אחד',
    features: [
      { icon: '⌂', title: 'פרטי העסק', text: 'שם העסק ותיאור השירותים — כדי שידעו בדיוק מה אתם מציעים.' },
      { icon: '☎', title: 'יצירת קשר', text: 'חיוג ישיר בלחיצה אחת ושליחת הודעת WhatsApp או מייל מהירה.' },
      { icon: '⌖', title: 'מיקום העסק', text: 'כתובת ברורה וקישור לניווט שמביא לקוחות עד אליכם.' },
      { icon: '◷', title: 'שעות פעילות', text: 'ימים ושעות ברורים — מתי אפשר להגיע או ליצור קשר.' },
      { icon: '▧', title: 'תמונות מוצרים וסביבה', text: 'תמונות של מוצרים, שירותים ומקום העסק – ללא תמונות של אנשים.' },
      { icon: '◎', title: 'קישורים חשובים', text: 'קישור לאתר העסק ולדרכי יצירת קשר נוספות.' }
    ]
  },
  how: {
    eyebrow: 'איך זה עובד?',
    title: 'שלושה צעדים מהעסק שלך ועד שימצאו אותו.',
    lead: '',
    steps: [
      { title: 'מספרים לנו על העסק שלך', text: 'שולחים לנו את פרטי העסק, תמונות מוצרים ודרכי יצירת קשר.' },
      { title: 'אנחנו בונים לך עמוד', text: 'יוצרים עבורך עמוד אישי ומסודר עם כל המידע החשוב.' },
      { title: 'העסק שלך מקבל מקום ברשת', text: 'מקבלים קישור אישי לעמוד שאפשר לשתף עם לקוחות ובכל מקום.' }
    ]
  },
  examples: {
    eyebrow: 'דוגמאות',
    title: 'ככה נראה עמוד עסק עם סמן.',
    lead: 'הצצה לעמודים לדוגמה של עסקים מסוגים שונים — כל אחד עם הפרטים, דרכי הקשר והמיקום שלו.',
    emptyText: 'עמודי העסקים שיוצגו בסמן יופיעו כאן בקרוב.',
    cardLabel: 'עמוד עסק בסמן',
    cardButton: 'לצפייה בעמוד העסק'
  },
  contact: {
    eyebrow: 'יצירת קשר',
    title: 'בואו נדבר!',
    lead: 'רוצים להצטרף לסמן או לשמוע פרטים נוספים? נשמח לשמוע מכם.',
    phone: environment.ownerPhone,
    email: environment.ownerEmail,
    whatsapp: environment.ownerWhatsapp,
    formTitle: 'או השאירו לנו פרטים',
    formSubtitle: 'נחזור אליכם בהקדם',
    submitButton: 'שליחת פרטים',
    formNote: 'הפנייה תישלח ישירות למייל של סמן.',
    successMessage: 'הפנייה נשלחה בהצלחה! נחזור אליך בהקדם.'
  },
  recommendations: {
    eyebrow: 'ממליצים על סמן',
    title: 'מה הלקוחות שלנו אומרים?',
    intro: ''
  },
  footer: {
    description: 'עמוד אינטרנט אישי, פשוט ומקצועי לכל עסק קטן ולעצמאי — כל הפרטים במקום אחד.',
    copyright: '© 2026 סמן. כל הזכויות שמורות.',
    phone: '',
    email: '',
    links: []
  }
};

export const SECTION_KEYS: SectionKey[] = ['header', 'hero', 'audience', 'why', 'how', 'examples', 'contact', 'recommendations', 'footer'];

export const DEFAULT_VISIBILITY: SiteVisibility = {
  header: true, hero: true, audience: true, why: true, how: true,
  examples: true, contact: true, recommendations: true, footer: true
};

// ---------------------------------------------------------------------------
// סכמת העורך: מכאן נבנה מסך העריכה בצורה גנרית.
// ---------------------------------------------------------------------------

export type FieldType = 'text' | 'textarea' | 'link' | 'email' | 'phone' | 'whatsapp';

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  max: number;
  required?: boolean;
  hint?: string;
}
export interface ListDef {
  key: string;
  label: string;
  itemLabel: string;
  fields: FieldDef[];
  min: number;
  max: number;
  hint?: string;
}
export interface SectionDef {
  key: SectionKey;
  title: string;
  summary: string;
  canHide: boolean;
  note?: string;
  fields: FieldDef[];
  lists: ListDef[];
}

const t = (key: string, label: string, max = 160, extra: Partial<FieldDef> = {}): FieldDef => ({ key, label, type: 'text', max, ...extra });
const ta = (key: string, label: string, max = 600, extra: Partial<FieldDef> = {}): FieldDef => ({ key, label, type: 'textarea', max, ...extra });

export const SECTION_DEFS: SectionDef[] = [
  {
    key: 'header', title: 'כותרת עליונה ותפריט', canHide: false,
    summary: 'הסלוגן ליד הלוגו, שמות הקישורים בתפריט והכפתור העליון',
    note: 'קישור בתפריט או כפתור נעלמים אוטומטית אם האזור שאליו הם מובילים מוסתר.',
    fields: [
      t('tagline', 'סלוגן ליד הלוגו (מופיע גם בעמודי העסקים)', 60),
      t('navWhy', 'תפריט: יתרונות', 30), t('navHow', 'תפריט: איך זה עובד', 30),
      t('navExamples', 'תפריט: דוגמאות', 30), t('navContact', 'תפריט: יצירת קשר', 30),
      t('navRecommendations', 'תפריט: המלצות', 30),
      t('cta', 'טקסט הכפתור העליון', 40)
    ],
    lists: []
  },
  {
    key: 'hero', title: 'עמוד ראשי', canHide: false,
    summary: 'כותרת ראשית, כותרת משנה, טקסטים וכפתורים',
    note: 'בכותרת הראשית אפשר לרדת שורה. אם השורה הראשונה מסתיימת בסימן קריאה, הוא יוצג בצבע אדום. כפתור בלי טקסט, או כפתור שמוביל לאזור מוסתר, לא יוצג.',
    fields: [
      t('eyebrow', 'כותרת משנה (מעל הכותרת הראשית)', 120),
      ta('title', 'כותרת ראשית', 160, { required: true }),
      ta('paragraph1', 'טקסט ראשון', 600), ta('paragraph2', 'טקסט שני', 600),
      t('primaryButton', 'כפתור ראשי (מוביל ליצירת קשר)', 40),
      t('secondaryButton', 'כפתור משני (מוביל ליתרונות)', 40),
      t('mapLabel', 'כיתוב על המפה', 60)
    ],
    lists: [{ key: 'points', label: 'נקודות קצרות מתחת לכפתורים', itemLabel: 'נקודה', min: 0, max: 5, fields: [t('text', 'טקסט', 60)] }]
  },
  {
    key: 'audience', title: 'למי סמן מיועד', canHide: true,
    summary: 'כותרת, תיאור וקהלי היעד עם האייקונים (מוצגים בעמוד הראשי)',
    note: 'האייקונים מוצגים מתחת לטקסט הראשי. אפשר להקליד כל סמל או אימוג׳י. כותרת ותיאור הם אופציונליים ומוצגים מעל האייקונים רק אם מילאת אותם.',
    fields: [t('title', 'כותרת', 80), ta('description', 'תיאור', 300)],
    lists: [{ key: 'items', label: 'קהלי יעד', itemLabel: 'קהל', min: 0, max: 8, fields: [t('icon', 'אייקון', 4), t('title', 'שם הקהל', 40)] }]
  },
  {
    key: 'why', title: 'היתרונות של סמן', canHide: true,
    summary: 'כל הכותרות והטקסטים של אזור "למה סמן"',
    fields: [t('eyebrow', 'כותרת משנה', 80), t('title', 'כותרת', 160), ta('lead', 'טקסט פתיחה', 500), t('subheading', 'כותרת מעל הכרטיסים', 160)],
    lists: [{ key: 'features', label: 'כרטיסי יתרונות', itemLabel: 'יתרון', min: 0, max: 9, fields: [t('icon', 'אייקון', 4), t('title', 'כותרת', 60), ta('text', 'תיאור', 300)] }]
  },
  {
    key: 'how', title: 'איך זה עובד', canHide: true,
    summary: 'שלבי התהליך וההסברים',
    note: 'מספור השלבים נוצר אוטומטית.',
    fields: [t('eyebrow', 'כותרת משנה', 80), t('title', 'כותרת', 160), ta('lead', 'טקסט פתיחה (אופציונלי)', 400)],
    lists: [{ key: 'steps', label: 'שלבי התהליך', itemLabel: 'שלב', min: 1, max: 6, fields: [t('title', 'כותרת השלב', 80), ta('text', 'הסבר', 300)] }]
  },
  {
    key: 'examples', title: 'דוגמאות עסקים', canHide: true,
    summary: 'כותרות וטקסטים של אזור הדוגמאות (העסקים עצמם מנוהלים בלשונית ניהול עסקים)',
    fields: [
      t('eyebrow', 'כותרת משנה', 80), t('title', 'כותרת', 160), ta('lead', 'טקסט פתיחה', 400),
      t('emptyText', 'הודעה כשאין עסקים להצגה', 160),
      t('cardLabel', 'כיתוב על תמונת הכרטיס', 40), t('cardButton', 'טקסט כפתור הכרטיס', 40)
    ],
    lists: []
  },
  {
    key: 'contact', title: 'צור קשר עם סמן', canHide: true,
    summary: 'כותרת, טקסט, טלפון, מייל, WhatsApp וטופס הפנייה',
    note: 'שינוי כתובת המייל כאן משנה גם את היעד שאליו נשלחות פניות הטופס באתר, ולכן חשוב להקליד אותה נכון. הטלפון והווטסאפ משפיעים רק על מה שמוצג ועל קישורי החיוג וההודעה. מספר WhatsApp בפורמט בינלאומי בלי + (למשל 972527192121). אם תרוקני אותו יוצג "לא זמין".',
    fields: [
      t('eyebrow', 'כותרת משנה', 80), t('title', 'כותרת', 120), ta('lead', 'טקסט', 400),
      { key: 'phone', label: 'טלפון', type: 'phone', max: 20 },
      { key: 'email', label: 'דוא״ל', type: 'email', max: 120 },
      { key: 'whatsapp', label: 'WhatsApp (ספרות בלבד)', type: 'whatsapp', max: 20 },
      t('formTitle', 'כותרת הטופס', 80), t('formSubtitle', 'כיתוב משנה בטופס', 120),
      t('submitButton', 'טקסט כפתור השליחה', 40), t('formNote', 'הערה מתחת לטופס', 160),
      t('successMessage', 'הודעה לאחר שליחה מוצלחת', 160)
    ],
    lists: []
  },
  {
    key: 'recommendations', title: 'ממליצים על סמן', canHide: true,
    summary: 'כותרות וטקסט הקדמה',
    note: 'את ההמלצות עצמן (שם הלקוח והטקסט) מנהלים בלשונית "ניהול עסקים" באזור "המלצות לקוחות". כאן עורכים רק את הכותרות. האזור מוצג באתר רק כשהוא מופעל ויש בו המלצות מפורסמות.',
    fields: [t('eyebrow', 'כותרת משנה', 80), t('title', 'כותרת', 160), ta('intro', 'טקסט הקדמה (אופציונלי)', 400)],
    lists: []
  },
  {
    key: 'footer', title: 'תחתית האתר', canHide: true,
    summary: 'טקסטים, פרטי קשר וקישורים',
    note: 'טלפון ומייל בתחתית מוצגים רק אם מילאת אותם. קישורים: כתובת מלאה (https://…), או mailto:, tel:, או כתובת פנימית שמתחילה ב-/.',
    fields: [
      ta('description', 'טקסט תיאור', 300), t('copyright', 'שורת זכויות יוצרים', 120),
      { key: 'phone', label: 'טלפון (אופציונלי)', type: 'phone', max: 20 },
      { key: 'email', label: 'דוא״ל (אופציונלי)', type: 'email', max: 120 }
    ],
    lists: [{
      key: 'links', label: 'קישורים בתחתית', itemLabel: 'קישור', min: 0, max: 8,
      fields: [t('label', 'טקסט הקישור', 40), { key: 'url', label: 'כתובת', type: 'link', max: 300 }]
    }]
  }
];

export function sectionDef(key: SectionKey): SectionDef {
  return SECTION_DEFS.find(section => section.key === key)!;
}

// ---------------------------------------------------------------------------
// עזרים: מיזוג, השוואה, ואימות
// ---------------------------------------------------------------------------

type Plain = Record<string, unknown>;
const isPlain = (value: unknown): value is Plain => !!value && typeof value === 'object' && !Array.isArray(value);
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** מחזיר כתובת בטוחה לקישור, או מחרוזת ריקה אם הכתובת אינה תקינה (חוסם javascript: וכד׳). */
export function safeUrl(value: string): string {
  const url = (value || '').trim();
  if (!url) return '';
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith('/') || url.startsWith('#')) return url;
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+(\/\S*)?$/i.test(url)) return `https://${url}`;
  return '';
}

export function telHref(phone: string): string {
  const digits = (phone || '').replace(/[^0-9+]/g, '');
  return digits ? `tel:${digits}` : '';
}

/** ממזג שינויים שנשמרו מעל ברירות המחדל. כל ערך לא תקין נזרק ונשאר הטקסט המקורי. */
export function mergeSection<K extends SectionKey>(key: K, override: unknown): SiteContent[K] {
  const defaults = DEFAULT_CONTENT[key] as unknown as Plain;
  const result = clone(defaults);
  if (!isPlain(override)) return result as unknown as SiteContent[K];
  const def = sectionDef(key);

  for (const field of def.fields) {
    const value = override[field.key];
    if (typeof value === 'string') result[field.key] = value.slice(0, field.max);
  }
  for (const list of def.lists) {
    const value = override[list.key];
    if (!Array.isArray(value)) continue;
    result[list.key] = value
      .filter(isPlain)
      .slice(0, list.max)
      .map(item => {
        const clean: Record<string, string> = {};
        for (const field of list.fields) {
          const raw = item[field.key];
          clean[field.key] = typeof raw === 'string' ? raw.slice(0, field.max) : '';
        }
        return clean;
      });
  }
  return result as unknown as SiteContent[K];
}

/** רק השדות שהשתנו ביחס לברירת המחדל. אם לא השתנה דבר מוחזר אובייקט ריק. */
export function diffFromDefaults(key: SectionKey, draft: Plain): Plain {
  const defaults = DEFAULT_CONTENT[key] as unknown as Plain;
  const def = sectionDef(key);
  const out: Plain = {};
  for (const field of def.fields) {
    if (draft[field.key] !== defaults[field.key]) out[field.key] = draft[field.key];
  }
  for (const list of def.lists) {
    if (JSON.stringify(draft[list.key]) !== JSON.stringify(defaults[list.key])) out[list.key] = draft[list.key];
  }
  return out;
}

export interface ValidationResult { ok: boolean; error: string; cleaned: Plain; }

/** מנקה רווחים, מסיר פריטי רשימה ריקים ומאמת סוגי שדות. הטקסט המוחזר בעברית מיועד להצגה למנהלת. */
export function validateDraft(key: SectionKey, draft: Plain): ValidationResult {
  const def = sectionDef(key);
  const cleaned: Plain = {};

  const checkField = (field: FieldDef, raw: unknown, where: string): { value: string; error: string } => {
    let value = typeof raw === 'string' ? raw.trim() : '';
    if (field.type === 'whatsapp') value = value.replace(/\D/g, '');
    if (field.required && !value) return { value, error: `${where}השדה "${field.label}" הוא חובה.` };
    if (value.length > field.max) return { value, error: `${where}"${field.label}" ארוך מדי (עד ${field.max} תווים).` };
    if (value) {
      if (field.type === 'email' && !EMAIL_PATTERN.test(value)) return { value, error: `${where}כתובת המייל ב"${field.label}" אינה תקינה.` };
      if (field.type === 'phone' && !/^[0-9+\-\s()]{5,20}$/.test(value)) return { value, error: `${where}הטלפון ב"${field.label}" אינו תקין.` };
      if (field.type === 'whatsapp' && !/^\d{8,15}$/.test(value)) return { value, error: `${where}מספר WhatsApp חייב להיות 8–15 ספרות בפורמט בינלאומי.` };
      if (field.type === 'link') {
        const safe = safeUrl(value);
        if (!safe) return { value, error: `${where}הקישור ב"${field.label}" אינו תקין. יש להקליד כתובת שמתחילה ב-https://‏, mailto:‏, tel:‏ או /` };
        value = safe;
      }
    }
    return { value, error: '' };
  };

  for (const field of def.fields) {
    const { value, error } = checkField(field, draft[field.key], '');
    if (error) return { ok: false, error, cleaned };
    cleaned[field.key] = value;
  }

  for (const list of def.lists) {
    const rawItems = Array.isArray(draft[list.key]) ? (draft[list.key] as Plain[]) : [];
    const items: Record<string, string>[] = [];
    for (let index = 0; index < rawItems.length; index++) {
      const item: Record<string, string> = {};
      let anyFilled = false;
      for (const field of list.fields) {
        const { value, error } = checkField(field, rawItems[index]?.[field.key], `${list.itemLabel} ${index + 1}: `);
        if (error) return { ok: false, error, cleaned };
        item[field.key] = value;
        if (value) anyFilled = true;
      }
      if (!anyFilled) continue;
      // קישור חייב להכיל גם טקסט וגם כתובת; אחרת הוא לא יוצג כראוי
      if (list.key === 'links' && (!item['label'] || !item['url'])) {
        return { ok: false, error: `${list.itemLabel} ${index + 1}: יש למלא גם טקסט וגם כתובת.`, cleaned };
      }
      items.push(item);
    }
    if (items.length < list.min) return { ok: false, error: `ב"${list.label}" חייב להישאר לפחות ${list.min === 1 ? 'פריט אחד' : list.min + ' פריטים'}.`, cleaned };
    if (items.length > list.max) return { ok: false, error: `ב"${list.label}" אפשר להציג עד ${list.max} פריטים.`, cleaned };
    cleaned[list.key] = items;
  }
  return { ok: true, error: '', cleaned };
}

/** עותק עריכה של תוכן האזור הנוכחי (מסונכרן עם הברירות והשינויים השמורים) */
export function draftFor(key: SectionKey, override: unknown): Plain {
  return clone(mergeSection(key, override) as unknown as Plain);
}
