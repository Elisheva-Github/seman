/** צבע מותג לכל עסק, נגזר באופן קבוע משם הקישור שלו (אין תמונת רקע, ולכן הצבע נותן לכל עמוד אופי משלו). */
export interface Theme { a: string; ad: string; t: string; }

const PALETTE: Theme[] = [
  { a: '#c9363e', ad: '#9f2a31', t: '#fff1ef' },  // אדום (צבע סמן)
  { a: '#12877f', ad: '#0c6660', t: '#e8f6f4' },  // טורקיז
  { a: '#2f6db5', ad: '#234f86', t: '#eaf2fc' },  // כחול
  { a: '#7b4fa3', ad: '#5d3b7d', t: '#f3ecf9' },  // סגול
  { a: '#cf6a22', ad: '#a3521a', t: '#fff0e3' },  // כתום
  { a: '#3b8a4b', ad: '#2c6b39', t: '#ebf6ed' },  // ירוק
  { a: '#c0407a', ad: '#962f5e', t: '#fceaf2' },  // ורוד
  { a: '#a97c1f', ad: '#805e16', t: '#fbf3df' }   // זהב
];

export function themeFor(seed: string): Theme {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

/** האות הראשונה של שם העסק (לתצוגה כשאין לוגו) */
export function initialOf(name: string): string {
  const first = Array.from((name || '').trim())[0];
  return first ? first.toUpperCase() : '•';
}
