const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'app', 'admin');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(adminDir);

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Skip files that already import triggerRevalidation
  if (content.includes('triggerRevalidation')) {
    return;
  }

  // Look for toast.success indicating a save/update/delete
  const regex = /toast\.success\([^)]+\);?/g;
  let match;
  let newContent = content;
  let lastIndexOffset = 0;

  const matches = [...content.matchAll(regex)];
  if (matches.length > 0) {
    let needsImport = false;
    for (const m of matches) {
      const lineStr = m[0];
      if (lineStr.includes('uploaded') || lineStr.includes('Welcome') || lineStr.includes('copied') || lineStr.includes('Exported') || lineStr.includes('Profile')) {
        continue;
      }
      
      const insertIdx = m.index + lineStr.length + lastIndexOffset;
      const injection = `\n          await triggerRevalidation();`;
      newContent = newContent.slice(0, insertIdx) + injection + newContent.slice(insertIdx);
      lastIndexOffset += injection.length;
      needsImport = true;
    }

    if (needsImport) {
      // Add import at the top
      const importStatement = `import { triggerRevalidation } from '@/lib/services/revalidation';\n`;
      newContent = importStatement + newContent;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Patched', file);
  }
});
