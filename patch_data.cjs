const fs = require('fs');
let file = 'src/data.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace exports with empty arrays/objects
content = content.replace(/export const initialAlerts: Alert\[\] = \[[\s\S]*?\];/g, 'export const initialAlerts: Alert[] = [];');
content = content.replace(/export const initialPosts: Post\[\] = \[[\s\S]*?\];/g, 'export const initialPosts: Post[] = [];');
content = content.replace(/export const initialProducts: Product\[\] = \[[\s\S]*?\];/g, 'export const initialProducts: Product[] = [];');
content = content.replace(/export const initialLocation: Location = \{[\s\S]*?\};/g, "export const initialLocation: Location = { province: '', district: '', subdistrict: '', isGps: false };");
content = content.replace(/export const initialNotifications: AppNotification\[\] = \[[\s\S]*?\];/g, 'export const initialNotifications: AppNotification[] = [];');
content = content.replace(/export const initialContactRequests: AdminContactRequest\[\] = \[[\s\S]*?\];/g, 'export const initialContactRequests: AdminContactRequest[] = [];');

// Mock exports
content = content.replace(/export const mockMorningBrief: MorningBrief = \{[\s\S]*?\};/g, 'export const mockMorningBrief: MorningBrief = { weather: { temp: "-", condition: "-", pm25: "-" }, announcements: 0, roadClosures: 0, events: 0, newShops: 0, greeting: "สวัสดีตอนเช้า" };');
content = content.replace(/export const mockShops: LocalShop\[\] = \[[\s\S]*?\];/g, 'export const mockShops: LocalShop[] = [];');
content = content.replace(/export const mockJobs: LocalJob\[\] = \[[\s\S]*?\];/g, 'export const mockJobs: LocalJob[] = [];');
content = content.replace(/export const mockEvents: LocalEvent\[\] = \[[\s\S]*?\];/g, 'export const mockEvents: LocalEvent[] = [];');
content = content.replace(/export const mockRealEstate: RealEstateItem\[\] = \[[\s\S]*?\];/g, 'export const mockRealEstate: RealEstateItem[] = [];');

fs.writeFileSync(file, content);
console.log('data.ts patched');
