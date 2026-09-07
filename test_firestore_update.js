import { readFileSync, writeFileSync } from 'fs';
let content = readFileSync('src/lib/firebase.ts', 'utf8');

const target = `    await setDoc(userRef, {
      ...profileData,
      displayName: profileData?.name,
      photoURL: profileData.avatar,
      updatedAt: serverTimestamp()
    }, { merge: true });`;

const replacement = `    
    const dataToUpdate: any = { ...profileData, updatedAt: serverTimestamp() };
    if (profileData.name !== undefined) dataToUpdate.displayName = profileData.name;
    if (profileData.avatar !== undefined) dataToUpdate.photoURL = profileData.avatar;
    
    // Remove undefined values
    Object.keys(dataToUpdate).forEach(key => {
      if (dataToUpdate[key] === undefined) {
        delete dataToUpdate[key];
      }
    });

    await setDoc(userRef, dataToUpdate, { merge: true });`;

content = content.replace(target, replacement);
writeFileSync('src/lib/firebase.ts', content);
