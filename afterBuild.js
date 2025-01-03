const fs = require('fs');
const path = require('path');

async function clearScriptsInPackageJson(packageJsonPath) {
  await new Promise((resolve) => {
    fs.readFile(packageJsonPath, 'utf8', (err, data) => {
      if (err) {
        console.error('读取package.json时发生错误:', err);
        return;
      }

      try {
        const packageJson = JSON.parse(data);
        packageJson.scripts = {};
        packageJson.devDependencies = {};
        packageJson.main = `dist/${packageJson.main.split('/').reverse()[0]}`;
        packageJson.module = `dist/${packageJson.module.split('/').reverse()[0]}`;

        fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (writeErr) => {
          if (writeErr) {
            console.error('写入package.json时发生错误:', writeErr);
            return;
          }
          console.log('package.json已更新');
          resolve();
        });
      } catch (parseErr) {
        console.error('解析package.json时发生错误:', parseErr);
      }
    });
  });
}

clearScriptsInPackageJson(path.join(__dirname, './dist/package.json'));
