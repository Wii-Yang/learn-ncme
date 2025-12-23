import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { changWindow } from '../utils.ts';

export function formatTime(str: string): number {
  if (!str) return 0;
  const list: string[] = str.split(':');
  const minutes: number = Number(list[0]);
  const seconds: number = Number(list[1]);
  return minutes * 60 + seconds;
}

/**
 * 播放视频
 * @param playbtn
 */
async function playVideo(playbtn: WebElement): Promise<void> {
  // 课程窗口
  const courseWindowHandle: string = await changWindow(playbtn);
  const browser: WebDriver = playbtn.getDriver();

  try {
    await browser.wait(until.elementLocated(By.css('.layout-main .record .title .title-body .live-title')));
    const liveTitle: string = await browser
      .findElement(By.css('.layout-main .record .title .title-body .live-title'))
      .getText();
    console.log(`打开【${liveTitle}】页面`);

    // 播放
    const replaybtn: WebElement = await browser.findElement(By.id('replaybtn'));
    await replaybtn.click();

    await browser.wait(until.elementLocated(By.css('section.ccH5FadeOut')));

    const ccH5FadeOut: WebElement = await browser.findElement(By.css('section.ccH5FadeOut'));
    await browser.executeScript('arguments[0].style.opacity = 1;', ccH5FadeOut);

    await browser.wait(async () => {
      const ccH5Time: WebElement = await browser.findElement(By.className('ccH5Time'));
      const ccH5TimeText: string = await ccH5Time.getText();
      const timeList = ccH5TimeText.split('\n');
      const currentTime: number = formatTime(timeList[0]!);
      const totalTime: number = formatTime(timeList[2]!);
      if (totalTime <= 0) return false;

      const progress: number = Math.round((currentTime / totalTime) * 10000) / 100;

      let progressText = `\r播放进度：${progress}%          `;

      if (progress >= 100) {
        progressText += '\n';
      }

      process.stdout.write(progressText);
      return progress >= 100 && totalTime > 0;
    });

    console.log(`完成【${liveTitle}】播放\n`);
  } catch {
    console.log(`\n视频播放过程中出现错误\n`);
  } finally {
    // 切换回课程窗口
    await browser.close();
    await browser.switchTo().window(courseWindowHandle);
  }
}

export default playVideo;
