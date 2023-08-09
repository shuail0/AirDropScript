const fs = require('fs');
const path = require('path');

// 读取当前目录中的所有文件
fs.readdirSync(__dirname).forEach(file => {
    // 排除index.js文件，避免自导入
    if (file === 'index.js') return;

    // 检查文件名是否符合 "task*.js" 的模式
    if (!file.startsWith('task') || path.extname(file) !== '.js') return;

    // 移除文件扩展名，得到函数名（或模块名）
    const moduleName = path.basename(file, '.js');

    // 动态导入并导出模块
    module.exports[moduleName] = require(path.join(__dirname, file));
});
