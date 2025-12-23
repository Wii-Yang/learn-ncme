import type User from '../user/index.ts';
import { By, type WebDriver, WebElement } from 'selenium-webdriver';
import Config from './config.ts';
import { createBrowser } from './browser.ts';
import { editUser } from '../user/management.ts';

/**
 * 登录账号
 * @param user
 */
async function loginUser(user: User): Promise<WebDriver> {
  console.log('【打开登录页】');
  const browser: WebDriver = await createBrowser({ headless: true, muteAudio: true });
  const url: string = Config.NCMEURL + '/login?url=https%3A%2F%2Fwww.ncme.org.cn%2Fstudy-center%2Fmy-course';
  await browser.get(url);

  try {
    const login: WebElement = await browser.findElement(By.className('login'));

    // 账号登录
    const tab__id_login: WebElement = await login.findElement(By.id('tab-IdLogin'));
    const tab__id_login_class: string = await tab__id_login.getAttribute('class');
    if (tab__id_login_class.search('is-active') < 0) {
      await browser.executeScript('arguments[0].scrollIntoView(false);', tab__id_login);
      await tab__id_login.click();
    }

    // 获取输入框
    const id_login: WebElement = await login.findElement(By.className('idLogin'));
    const input: WebElement[] = await id_login.findElements(
      By.css('.el-form .el-form-item .el-form-item__content .el-input .el-input__inner'),
    );

    console.log('【输入用户名】');
    await input[0]!.sendKeys(user.getUsername());
    console.log('【输入密码】');
    await input[1]!.sendKeys(user.getPassword());

    console.log('【勾选复选框】');
    const checkbox: WebElement = await id_login.findElement(
      By.css('.el-form .el-form-item .el-form-item__content .el-checkbox'),
    );
    await checkbox.click();

    console.log('【登录】');
    const login_btn: WebElement = await id_login.findElement(
      By.css('.el-form .el-form-item .el-form-item__content .login_btn'),
    );
    await login_btn.click();

    // 打开学习中心
    await browser.wait(async () => {
      const url: string = await browser.getCurrentUrl();
      return url === Config.NCMEURL + '/study-center/my-course';
    }, 1000 * 10);

    if (!user.getName()) {
      // 获取姓名
      const userinfo: string = await browser.executeScript('return localStorage.getItem("userinfo");');
      const userInfo = JSON.parse(userinfo);
      user.setName(userInfo.value.realName);

      editUser(user);
    }

    console.log('【登录成功】');
  } catch {
    console.error('登录失败');
    throw 'login error';
  }
  return browser;
}

export default loginUser;
