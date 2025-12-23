import initSystem from './system/index.ts';
import { readlineSync } from './utils.ts';
import type User from './user/index.ts';
import getUserByMenus from './user/menus.ts';
import loginUser from './system/login.ts';
import startLearn from './learn/index.ts';
import type { WebDriver } from 'selenium-webdriver';

// 主函数
async function main() {
  try {
    // 初始化系统
    await initSystem();

    // 获取用户
    const user: User = await getUserByMenus();

    // 登录
    const browser: WebDriver = await loginUser(user);

    // 开始学习
    await startLearn(browser);
  } catch (e) {
    switch (e) {
      case 'exit':
        // 结束
        console.log('输入回车键结束......');
        await readlineSync();
        break;
      case 'login error':
        // 登录失败
        await main();
        break;
    }
  }
}

main();
