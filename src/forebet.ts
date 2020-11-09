//import puppeteer, { ElementHandle, Page } from "puppeteer";
import {
  Builder,
  By,
  ThenableWebDriver,
  until,
  WebElement,
} from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import * as chromium from "chromium-version";
const cheerio = require("cheerio");
const moment = require("moment");

export const scrapeCols = [
  { label: "Country", value: "country" },
  { label: "League", value: "league" },
  { label: "Home team", value: "home" },
  { label: "Away team", value: "away" },
  { label: "Value bet", value: "value" },
  { label: "score", value: "score" },
  { label: "Goals H", value: "homeGoals" },
  { label: "Goals A", value: "awayGoals" },
  { pred1: "prob in % 1" },
  { predx: "prob in % x" },
  { pred2: "prob in % 2" },
  { forebet: "forebet" },
  { exScore: "exScore" },
  { avg: "avg" },
  { odd: "odd" },
  { kelly: "kelly" },
  { label: "Match status", value: "matchStatus" },
  { label: "Home team / last match", value: "homeLastMatch" },
  { label: "Away team / last match", value: "awayLastMatch" },
  { label: "Event time Fore", value: "forebetEventTime" },
  { label: "Event time Api", value: "eventTime" },
  { label: "Uncertain?", value: "uncertain" },
];

const getDriver = (): ThenableWebDriver => {
  return new Builder()
    .forBrowser("chrome")
    .setChromeOptions(
      new Options()
        .headless()
        .addArguments("--no-sandbox")
        .addArguments("--disable-dev-shm-usage")
        .setChromeBinaryPath(chromium.path)
    )
    .build();
};

export async function getGameDetails() {
  const driver = getDriver();
  try {
    const teamName = "Ilves 2";
    await driver.get(
      "https://www.forebet.com/en/football-tips-and-predictions-for-today"
    );
    const linkLocator = By.xpath(`//a[contains(text(), '${teamName}')]`);
    const link = await driver.findElement(linkLocator);
    const href = await link.getAttribute("href");
    await driver.get(href);
    const predSelector = ".inPred.predict";
    driver.wait(until.elementLocated(By.css(predSelector)));
    const el = await driver.findElement(By.css(predSelector));
    console.log(await el.getText());
  } finally {
    await driver.quit();
  }
}

type matchOutput = {
  country: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  pred1: string;
  predx: string;
  pred2: string;
  forebet: string;
  exScore: string;
  avg: string;
  odd: string;
  kelly: string;
  value: number;
  forebetEventTime: string;
};

const scrapeH2hTable = async (table: WebElement): Promise<matchOutput> => {
  const html = await table.getAttribute("outerHTML");
  const $ = cheerio.load(html);
  const tr = $("tr.tr_0").first();

  try {
    const homeTeam = $(".homeTeam", tr);
    const awayTeam = $(".awayTeam", tr);
    const pred1 = $("td:nth-child(2)", tr);
    const predx = $("td:nth-child(3)", tr);
    const pred2 = $("td:nth-child(4)", tr);
    const forebet = $(".forepr", tr);
    const exScore = $(".ex_sc", tr);
    const avg = $(".avg_sc", tr);
    const odd = $(".odd", tr);
    const kelly = $(".kellyTab", tr);
    const forebetEventTime = $(".date_bah", tr).text();

    return {
      homeTeam: homeTeam ? $(".homeTeam", tr).first().text() : "",
      awayTeam: awayTeam ? $(".awayTeam", tr).first().text() : "",
      pred1: pred1 ? $("td:nth-child(2)", tr).first().text() : "",
      predx: predx ? $("td:nth-child(3)", tr).first().text() : "",
      pred2: pred2 ? $("td:nth-child(4)", tr).first().text() : "",
      forebet: forebet ? $(".forepr", tr).first().text() : "",
      exScore: exScore ? $(".ex_sc", tr).first().text() : "",
      avg: avg ? $(".avg_sc", tr).first().text() : "",
      odd: odd ? $(".odd", tr).first().text() : "",
      kelly: kelly ? $(".kellyTab", tr).first().text() : "",
      forebetEventTime: forebetEventTime ? $(".date_bah", tr).text() : "",
      country: "",
      league: "",
      value: NaN,
    };
  } catch (error) {
    return {
      homeTeam: "",
      awayTeam: "",
      pred1: "",
      predx: "",
      pred2: "",
      forebet: "",
      exScore: "",
      avg: "",
      odd: "",
      kelly: "",
      forebetEventTime: "",
      country: "",
      league: "",
      value: NaN,
    };
  }
};

export async function getRelevantGamesFromForebet() {
  const driver = getDriver();
  const hrefs = [] as string[];
  try {
    await driver.get("https://www.forebet.com/en/value-bets#");
    console.log("loaded landing page");
    const tableLocator = By.css(".schema.tblen");
    driver.wait(until.elementLocated(tableLocator));
    const output = [] as matchOutput[];
    const temp = [] as any[];
    const links = await driver.findElements(By.css(".tnmscn"));
    for (const link of links) {
      console.log("adding link data...");
      const parent = await link.findElement(By.xpath("./.."));
      const tr = await parent.findElement(By.xpath("./.."));
      const div = await parent.findElement(By.css(".shortagDiv"));
      const valueEl = await tr.findElement(By.css("td:last-child"));
      const valueElText = await valueEl.getText();
      const value = parseInt(
        valueElText.trim().replace(/%.*/, "").replace("value", "value").trim()
      );
      const raw = await div.getAttribute("onclick");
      const re = new RegExp("'([^']+)'", "g");
      if (!raw) {
        console.log("No league and country!", await div.getText());
        continue;
      }
      const [country, league] = (raw.match(re) || ["", "", ""])
        .filter((_, i) => i < 2)
        .map((m) => m.replace(/^'(.*)'$/, "$1"));
      const href = await link.getAttribute("href");
      const dateCont = await parent.findElement(By.css(".date_bah"));
      const forebetEventTime = await dateCont.getText();
      if (
        moment(forebetEventTime, "D/M/Y h:m").diff(
          moment().add(1, "day").startOf("day").add(11, "hours")
        ) < 0
      ) {
        hrefs.push(href);
        temp.push({ country, league, value, forebetEventTime });
        console.log(valueElText, country, league);
      } else {
        console.log("match filtered based on time " + forebetEventTime);
      }
    }
    for (let i = 0; i < hrefs.length; i++) {
      console.log(`Loading detail page ${i}`);
      await driver.get(hrefs[i]);
      const tableLocator = By.id("1x2_table");
      driver.wait(until.elementLocated(tableLocator));
      await driver.wait(until.elementLocated(tableLocator));
      const table = driver.findElement(tableLocator);
      const data = { ...(await scrapeH2hTable(table)), ...temp[i] };
      output.push(data);
    }
    output.sort((a, b) => b.value - a.value);
    return output;
  } finally {
    await driver.quit();
  }
}

//getRelevantGamesFromForebet(true, false);
