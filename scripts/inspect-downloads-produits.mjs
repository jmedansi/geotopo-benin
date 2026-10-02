import fs from 'node:fs';
import path from 'node:path';

const sourceDir = 'C:\\Users\\jmeda\\Downloads\\Produits';

function scan() {
  if (!fs.existsSync(sourceDir)) {
    console.error('Directory does not exist:', sourceDir);
    return;
  }

  const items = fs.readdirSync(sourceDir, { withFileTypes: true });
  const result = [];

  for (const item of items) {
    const fullPath = path.join(sourceDir, item.name);
    if (item.isDirectory()) {
      const files = fs.readdirSync(fullPath);
      const details = [];
      let textContent = '';
      for (const f of files) {
        const fp = path.join(fullPath, f);
        const stat = fs.statSync(fp);
        details.push({ name: f, size: stat.size, ext: path.extname(f).toLowerCase() });
        if (f.endsWith('.txt')) {
          try {
            textContent += fs.readFileSync(fp, 'utf8') + '\n';
          } catch (e) {}
        }
      }
      result.push({ name: item.name, isDir: true, files: details, textContent });
    } else {
      const stat = fs.statSync(fullPath);
      result.push({ name: item.name, isDir: false, size: stat.size, ext: path.extname(item.name).toLowerCase() });
    }
  }

  console.log(JSON.stringify(result, null, 2));
}

scan();
