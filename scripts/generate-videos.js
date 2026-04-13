import https from 'https';
import fs from 'fs';
import path from 'path';

const url = 'https://www.w3schools.com/html/mov_bbb.mp4';
const destFolder = path.join(process.cwd(), 'public', 'videos');
const destFile = path.join(destFolder, 'hero.mp4');

if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

try {
  await new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destFile);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log('Video downloaded successfully to ' + destFile);
        resolve();
      });
    }).on('error', reject);
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
