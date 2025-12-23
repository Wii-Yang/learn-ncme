import { By, until, type WebDriver, type WebElement } from 'selenium-webdriver';
import { createRequire } from 'module';

interface Answer {
  type: string;
  title: string;
  answer: string;
}

const require = createRequire(import.meta.url);
const answer1: Answer[] = require('./answer/1.json');
const answer2: Answer[] = require('./answer/2.json');
const answer3: Answer[] = require('./answer/3.json');
const answer4: Answer[] = require('./answer/4.json');
const answer5: Answer[] = require('./answer/5.json');
const answer6: Answer[] = require('./answer/6.json');

/**
 * 考试
 * @param btn
 */
async function examination(btn: WebElement) {
  await btn.click();

  console.log(`【打开考试页】`);
  const browser: WebDriver = btn.getDriver();

  await browser.wait(until.elementLocated(By.css('.q-layout .layout-title .subtitle')));
  await browser.wait(async (): Promise<boolean> => {
    const title: string = await browser.findElement(By.css('.layout-title .subtitle')).getText();
    return !!title;
  });

  const title: string = await browser.findElement(By.css('.layout-title .subtitle')).getText();
  console.log(`开始【${title}】考试`);

  const answer: Answer[] = getAnswer(title);

  // 获取试题
  const qItemList: WebElement[] = await browser.findElements(By.css('#qbank-body .past-body .qItem'));
  const qItemTotal: number = qItemList.length;
  process.stdout.write(`考试进度：0/${qItemTotal}`);
  for (let i: number = 0; i < qItemTotal; i++) {
    const qItem: WebElement = qItemList[i]!;

    // 答题
    await answerQuestion(qItem, answer);

    let progressText: string = `\r考试进度：${i + 1}/${qItemTotal}`;
    if (i === qItemTotal - 1) {
      progressText += '\n';
    }
    process.stdout.write(progressText);
  }

  // 提交
  const submit: WebElement = await browser.findElement(By.css('#sidebar .sidebar-options .btn-block .submit'));
  await browser.executeScript('arguments[0].scrollIntoView(false);', submit);
  await submit.click();

  // 等待确认弹窗出现
  await browser.wait(until.elementLocated(By.css('.modal-mask .modal .modal-body .tips-modal-block .btn-end')));
  const btnEnd: WebElement = await browser.findElement(
    By.css('.modal-mask .modal .modal-body .tips-modal-block .btn-end'),
  );

  await btnEnd.click();
  console.log(`完成【${title}】\n`);

  // 返回
  await browser.wait(until.elementLocated(By.css('.report-block .btn-block .back-btn')));
  const backBtn: WebElement = await browser.findElement(By.css('.report-block .btn-block .back-btn'));
  await backBtn.click();

  await browser.sleep(1000 * 2);
}

/**
 * 通过考试名称获取答案
 * @param title
 */
function getAnswer(title: string): Answer[] {
  switch (title) {
    case '吸入性损伤的诊断和治疗课后测试':
      return answer1;
    case '突发事件烧伤伤员医疗救治课后测试':
      return answer2;
    case '核和辐射损伤临床救治课后测试':
      return answer3;
    case '突发事件人群心理评估和干预课后测试':
      return answer4;
    case '突发事件创伤伤员医疗救治课后测试':
      return answer5;
    case '急性中毒医疗应急救治课后测试':
      return answer6;
    default:
      return [];
  }
}

/**
 * 答题
 * @param qItem
 * @param answerList
 */
async function answerQuestion(qItem: WebElement, answerList: Answer[]) {
  const browser: WebDriver = qItem.getDriver();
  const qTitle: string = await qItem.findElement(By.css('.title-block .block .q-title')).getText();
  const qType: string = await qItem.findElement(By.css('.title-block .block .q-type')).getText();

  // 获取答案
  const answer: Answer | undefined = answerList
    .filter((item: Answer): boolean => item.type === qType)
    .find((item: Answer): boolean => item.title === qTitle);
  if (!answer) throw 'no answer';

  // 获取选项
  const options: WebElement[] = await qItem.findElements(By.css('.options-block ul li'));
  for (let i: number = 0; i < options.length; i += 1) {
    const option: WebElement = options[i]!;
    const mark: string = await option.findElement(By.className('mark')).getText();
    if (answer.answer.search(mark) !== -1) {
      await browser.executeScript('arguments[0].scrollIntoView(false);', option);
      await option.click();
    }
  }
}

export default examination;
