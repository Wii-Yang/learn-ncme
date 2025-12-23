import * as readline from 'node:readline';
import type { WebDriver, WebElement } from 'selenium-webdriver';

/**
 * 控制台输入
 * @param question
 */
export function readlineSync(question?: string): Promise<string> {
  const rl: readline.Interface = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (question) {
    return new Promise((resolve: (data: string) => void): void => {
      rl.question(question, (line: string): void => {
        rl.close();
        resolve(line);
      });
    });
  }

  return new Promise((resolve: (data: string) => void): void => {
    rl.on('line', (data: string): void => {
      rl.close();
      resolve(data);
    });
  });
}

/**
 * 切换窗口
 * @param btn
 */
export async function changWindow(btn: WebElement): Promise<string> {
  const browser: WebDriver = btn.getDriver();
  // 旧窗口
  const oldWindowHandle: string = await browser.getWindowHandle();

  try {
    // 跳转前所有窗口
    const beforeAllWindowHandles: string[] = await browser.getAllWindowHandles();

    // 跳转
    await browser.executeScript('arguments[0].scrollIntoView(false);', btn);
    await btn.click();

    await browser.sleep(1000 * 2);

    // 跳转后所有窗口
    const afterAllWindowHandles: string[] = await browser.getAllWindowHandles();

    // 新窗口
    const newWindowHandle: string = afterAllWindowHandles.find(
      (item: string): boolean => !beforeAllWindowHandles.includes(item),
    )!;

    // 切换到新窗口
    await browser.switchTo().window(newWindowHandle);
  } catch (error) {
    console.log('\n切换窗口时出现错误\n');
    throw error;
  }

  return oldWindowHandle;
}
