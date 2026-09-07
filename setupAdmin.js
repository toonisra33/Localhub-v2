import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import fs from 'fs';

const configStr = fs.readFileSync('./firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function setup() {
  try {
    const cred = await createUserWithEmailAndPassword(auth, 'toonisra33@gmail.com', 'Toon@15051990');
    console.log('User created:', cred.user.uid);
    const userRef = doc(db, 'users', cred.user.uid);
    await setDoc(userRef, {
      uid: cred.user.uid,
      email: 'toonisra33@gmail.com',
      displayName: 'Toon Isra',
      photoURL: 'https://ui-avatars.com/api/?name=Toon&background=random',
      phone: '',
      address: 'ระบบกลาง',
      villageOrCondo: 'แอดมินระบบ',
      bio: 'ผู้ดูแลระบบสูงสุด',
      occupation: 'System Admin',
      role: 'admin',
      isVerified: true,
      reputationScore: 100,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('Firestore doc created');
    process.exit(0);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log('User already exists. You can login.');
    } else {
      console.error(e);
    }
    process.exit(1);
  }
}
setup();
