import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

const configStr = fs.readFileSync('./firebase-applet-config.json', 'utf8');
const config = JSON.parse(configStr);
const app = initializeApp(config);
const auth = getAuth(app);

async function test() {
  try {
    const cred = await signInWithEmailAndPassword(auth, 'toonisra33@gmail.com', 'Toon@15051990');
    console.log('Login successful! UID:', cred.user.uid);
    process.exit(0);
  } catch (e) {
    console.error('Login failed:', e.code);
    process.exit(1);
  }
}
test();
