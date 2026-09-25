export const inquiryTypes = ['Booking','Collaboration','Press & media','Other'];
export type ContactInput = {id: string;name: string;email: string;inquiryType: string;message: string;privacyConsent: boolean;startedAt: number;captchaToken: string;website: string};
export function validateContact(raw: unknown): {error: string} | {value: ContactInput} {
 if(!raw || typeof raw !== 'object' || Array.isArray(raw)) return {error:'Invalid request.'};
 const input = raw as Record<string, unknown>;
 for (const key of ['id','name','email','inquiryType','message','captchaToken','website']) {if(typeof input[key] !== 'string') return {error:'Please complete the required fields.'};}
 const value = Object.fromEntries(Object.entries(input).map(([key,val]) => [key,typeof val === 'string' ? val.trim() : val])) as ContactInput;
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id)) return {error:'Please refresh the page and try again.'};
 if(value.website) return {error:'Invalid request.'};
 if(value.name.length < 2 || value.name.length > 80 || /[\r\n]/.test(value.name)) return {error:'Please enter a name between 2 and 80 characters.'};
 if(value.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return {error:'Please enter a valid email address.'};
 if(!inquiryTypes.includes(value.inquiryType)) return {error:'Please choose an inquiry type.'};
 if(value.message.length < 10 || value.message.length > 3000) return {error:'Your message must contain between 10 and 3,000 characters.'};
 if(value.privacyConsent !== true) return {error:'Please agree to the use of your details to respond to your inquiry.'};
 if(typeof value.startedAt !== 'number' || !Number.isFinite(value.startedAt) || Date.now() - value.startedAt < 2000) return {error:'Please take a moment before sending.'};
 if(!value.captchaToken || value.captchaToken.length > 2048) return {error:'Please complete the security check.'};
 return {value};
}

// A small per-process backstop; Turnstile is required for every real submission.
const buckets = new Map<string,number[]>();
export function isRateLimited(email: string) {
 const now = Date.now(), windowMs=60*60*1000;
 for(const [key,times] of buckets) if(!times.some(time=>now-time<windowMs)) buckets.delete(key);
 const key=email.toLowerCase(), times=(buckets.get(key)||[]).filter(time=>now-time<windowMs);
 if(times.length>=4) return true;
 if(buckets.size>=1000 && !buckets.has(key)) buckets.delete(buckets.keys().next().value!);
 buckets.set(key,[...times,now]);return false;
}
