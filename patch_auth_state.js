import fs from 'fs';
let content = fs.readFileSync('src/context/CommunityContext.tsx', 'utf8');

const target = `reputationScore: data.reputationScore || 50
            }));`;

const replacement = `reputationScore: data.reputationScore || 50,
              occupation: data.occupation || '',
              birthDate: data.birthDate || '',
              relationshipStatus: data.relationshipStatus || '',
              emergencyContactName: data.emergencyContactName || '',
              emergencyContactPhone: data.emergencyContactPhone || ''
            }));`;

content = content.replace(target, replacement);

fs.writeFileSync('src/context/CommunityContext.tsx', content);
