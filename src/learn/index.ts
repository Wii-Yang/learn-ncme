import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import playVideo from './video.ts';
import examination from './examination.ts';

async function startLearn(browser: WebDriver) {
  await openCourse(browser);

  let isEnd: boolean = false;
  do {
    // 等待课程列表加载
    await browser.wait(until.elementLocated(By.css('.ncmeTabArea .courseStudyArea .courseStudyItem')));
    const courseStudyItem: WebElement = await browser.findElement(
      By.css('.ncmeTabArea .courseStudyArea .courseStudyItem'),
    );
    const courseStudyInfoArea: WebElement = await courseStudyItem.findElement(By.className('courseStudyInfoArea'));
    const courseStudyInfoAreaClass: string = await courseStudyInfoArea.getAttribute('class');

    if (courseStudyInfoAreaClass.search('hideInfo') >= 0) {
      // 展开课程列表
      const courseStudyTitle: WebElement = await courseStudyItem.findElement(By.className('courseStudyTitle'));
      await courseStudyTitle.click();
    }

    const courseStudyInfoDetailList: WebElement[] = await courseStudyInfoArea.findElements(
      By.className('courseStudyInfoDetail'),
    );

    for (let i: number = 0; i < courseStudyInfoDetailList.length; i++) {
      const courseStudyInfoDetail: WebElement = courseStudyInfoDetailList[i]!;

      const courseStatus: string = await courseStudyInfoDetail.findElement(By.className('courseStatus')).getText();
      if (courseStatus === '已完成' || courseStatus === '已通过') {
        continue;
      }

      const courseStudyLiveInfo: WebElement[] = await courseStudyInfoDetail.findElements(
        By.css('.courseStudyLiveInfo p'),
      );
      const courseName: string = await courseStudyLiveInfo[0]!.getText();

      const playbtn: WebElement = await courseStudyInfoDetail.findElement(By.className('playbtn'));
      const playbtnText: string = await playbtn.findElement(By.css('span')).getText();

      if (playbtnText === '立即播放') {
        console.log(`开始播放【${courseName}】`);
        await playVideo(playbtn);
      } else if (playbtnText === '去做题') {
        console.log(`开始【${courseName}】`);
        await examination(playbtn);
      }

      await browser.navigate().refresh();

      isEnd = i === courseStudyInfoDetailList.length - 1;
      break;
    }
  } while (!isEnd);

  console.log(`完成【2025全国医疗应急能力培训系列课程】课程学习`);
}

/**
 * 打开课程
 * @param browser
 */
async function openCourse(browser: WebDriver) {
  console.log('【等待课程列表加载】');
  await browser.wait(async () => {
    const courseList: WebElement[] = await browser.findElements(By.css('.courseList .courseItem'));
    return courseList.length > 0;
  });

  // 课程列表
  const courseList: WebElement[] = await browser.findElements(By.css('.courseList .courseItem'));

  for (let i: number = 0; i < courseList.length; i++) {
    const course: WebElement = courseList[i]!;
    const courseItemTitle: string = await course
      .findElement(By.css('.courseItemContent .courseTitleArea .courseItemTitle'))
      .getText();
    if (courseItemTitle !== '2025全国医疗应急能力培训系列课程') {
      continue;
    }
    const courseTitleAreaSpan: WebElement[] = await course.findElements(
      By.css('.courseItemContent .courseTitleArea span'),
    );
    const courseTitleAreaSpanText: string = await courseTitleAreaSpan[1]!.getText();
    if (courseTitleAreaSpanText !== '未开始' && courseTitleAreaSpanText !== '学习中') {
      continue;
    }

    const courseBtnDeep: WebElement = await course.findElement(
      By.css('.courseItemContent .courseItemBtnList .courseBtnDeep'),
    );
    await courseBtnDeep.click();
    console.log('\n打开【2025全国医疗应急能力培训系列课程】课程\n');
    break;
  }
}

export default startLearn;
