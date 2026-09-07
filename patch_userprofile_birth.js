import fs from 'fs';
let content = fs.readFileSync('src/components/UserProfile.tsx', 'utf8');

const target = `{userProfile.relationshipStatus && (`;

const newField = `{userProfile.birthDate && (
                <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white p-2 rounded-xl border border-slate-100 shadow-xs">
                  <Calendar size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">เกิด: {new Date(userProfile.birthDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              )}\n              `;

content = content.replace(target, newField + target);

// Also need to import Calendar if it's not imported
if (!content.includes('Calendar,')) {
  content = content.replace(/import \{/, 'import { Calendar,');
}

fs.writeFileSync('src/components/UserProfile.tsx', content);
