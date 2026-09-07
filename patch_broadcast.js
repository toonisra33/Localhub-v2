import fs from 'fs';
let content = fs.readFileSync('src/context/BroadcastContext.tsx', 'utf8');

const targetStr = `          }
        }
      } else {
        setActiveBroadcast(null);
      }
    });

    return () => unsub();`;

const replaceStr = `          }
        }
      } else {
        setActiveBroadcast(null);
      }
    }, (error) => {
      console.warn("Firestore Broadcast error:", error);
    });

    return () => unsub();`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync('src/context/BroadcastContext.tsx', content);
