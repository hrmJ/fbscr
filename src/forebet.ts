//import puppeteer, { ElementHandle, Page } from "puppeteer";
import {
  Builder,
  By,
  ThenableWebDriver,
  until,
  WebElement,
} from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
//import "chromedriver";
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
  { tipOdd: "tip odd" },
  { H: "H" },
  { X: "X" },
  { A: "A" },
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
  tipOdd: string;
  H: string;
  X: string;
  A: string;
  kelly: string;
  value: number;
  forebetEventTime: string;
};

type addedDetailsOutput = {
  propinUnder: string;
  propinOver: string;
  forPredicUO: string;
  forUoOdds: string;
  btsNo: string;
  btsYes: string;
  btsOdd: string;
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
    let tipOdd = "";
    let H = "";
    let X = "";
    let A = "";
    try {
      [tipOdd, H, X, A] = odd
        .text()
        .split("\n")
        .filter((t: string) => t && !["1", "-1"].includes(t));
    } catch (err) {}
    return {
      homeTeam: homeTeam ? $(".homeTeam", tr).first().text() : "",
      awayTeam: awayTeam ? $(".awayTeam", tr).first().text() : "",
      pred1: pred1 ? $("td:nth-child(2)", tr).first().text() : "",
      predx: predx ? $("td:nth-child(3)", tr).first().text() : "",
      pred2: pred2 ? $("td:nth-child(4)", tr).first().text() : "",
      forebet: forebet ? $(".forepr", tr).first().text() : "",
      exScore: exScore ? $(".ex_sc", tr).first().text() : "",
      avg: avg ? $(".avg_sc", tr).first().text() : "",
      kelly: kelly ? $(".kellyTab", tr).first().text() : "",
      tipOdd,
      H,
      X,
      A,
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
      tipOdd: "",
      H: "",
      X: "",
      A: "",
      kelly: "",
      forebetEventTime: "",
      country: "",
      league: "",
      value: NaN,
    };
  }
};

const addMoreDetails = async (
  driver: ThenableWebDriver
): Promise<addedDetailsOutput> => {
  const uoLink = await driver.findElement(By.css("#uo_t_butt"));
  await uoLink.click();
  const propInUnderCont = await driver.findElement(
    By.css("#uo_table .tr_0 > td:nth-child(2)")
  );
  const propInOverCont = await driver.findElement(
    By.css("#uo_table .tr_0 > td:nth-child(3)")
  );
  const forebetUoCont = await driver.findElement(By.css(".forepr.predUoSp"));
  const uoOddsCont = await driver.findElement(
    By.css("#uo_table .tr_0 > .bigOnly.odd")
  );
  const uoVals = {
    propinUnder: await propInUnderCont.getText(),
    propinOver: await propInOverCont.getText(),
    forPredicUO: await forebetUoCont.getText(),
    forUoOdds: await uoOddsCont.getText(),
  };
  const btsBut = await driver.findElement(By.css("#bts_t_butt"));
  await btsBut.click();
  const btsNoCont = await driver.findElement(
    By.css("#bts_table .tr_0 > td:nth-child(2)")
  );
  const btsYesCont = await driver.findElement(
    By.css("#bts_table .tr_0 > td:nth-child(3)")
  );
  const btsOddsCont = await driver.findElement(
    By.css("#bts_table .tr_0 > .bigOnly.odd")
  );
  const btsVals = {
    btsNo: (await btsNoCont.getText()) || "?",
    btsYes: (await btsYesCont.getText()) || "?",
    btsOdd: (await btsOddsCont.getText()) || "?",
  };
  return { ...uoVals, ...btsVals };
};

type relevantGamesOutput = {
  output: matchOutput[] | null;
  stop: number;
  total: number;
};

export async function getRelevantGamesFromForebet(
  start: number,
  addr: string = ""
): Promise<relevantGamesOutput> {
  const driver = getDriver();
  const hrefs = [] as string[];
  let ret = { stop: 0, output: null, total: 0 };
  try {
    await driver.get(
      addr ||
        "https://www.forebet.com/en/football-tips-and-predictions-for-today"
    );
    console.log("loaded landing page");
    const tableLocator = By.css(".schema.tblen");
    driver.wait(until.elementLocated(tableLocator));
    const output = [] as matchOutput[];
    const temp = [] as any[];
    const moreLinkLocator = By.css("#mrows span");
    const moreLink = await driver.findElement(moreLinkLocator);
    driver.wait(until.elementLocated(moreLinkLocator));
    if (moreLink) {
      try {
        await moreLink.click();
        await driver.sleep(10);
      } catch (err) {
        await driver.executeScript('ltodrows("1x2","1","","0")');
        await driver.sleep(10);
        console.log('Unable to click "more"');
      }
    }
    const links = await driver.findElements(By.css(".tnmscn"));
    let i = 0;
    for (const link of links) {
      i++;
      console.log("adding link data...");
      const parent = await link.findElement(By.xpath("./../.."));
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
      const [country, league] = (
        raw.replace("''", " ").match(re) || ["", "", ""]
      )
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
    const total = hrefs.length;
    const firstI = start || 0;
    const stop = firstI + 100;
    for (let i = 0; i < hrefs.length; i++) {
      if (i > stop) {
        break;
      }
      if (i < firstI) {
        continue;
      }
      console.log(`Loading detail page ${i}`);
      await driver.get(hrefs[i]);
      const tableLocator = By.id("1x2_table");
      driver.wait(until.elementLocated(tableLocator));
      await driver.wait(until.elementLocated(tableLocator));
      const table = driver.findElement(tableLocator);
      const data = {
        ...(await scrapeH2hTable(table)),
        ...temp[i],
        ...(await addMoreDetails(driver)),
      };
      output.push(data);
    }
    output.sort((a, b) => b.value - a.value);
    ret = { stop, output, total };
  } finally {
    await driver.quit();
  }
  return ret;
}

//getRelevantGamesFromForebet(true, false);

