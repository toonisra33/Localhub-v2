import fs from 'fs';
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

const target = `  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }`;

const replacement = `  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    throw error;
  }`;

content = content.replace(target, replacement);
fs.writeFileSync('src/lib/firebase.ts', content);
