//import puppeteer, { ElementHandle, Page } from "puppeteer";
import { Builder, ThenableWebDriver } from "selenium-webdriver";
import { Options } from "selenium-webdriver/chrome";
import "chromedriver";
import * as chromium from "chromium-version";
import MatchListReader from "./forebet/MatchListReader";
import DetailScraper, { matchOutput } from "./forebet/DetailScraper";

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

type relevantGamesOutput = {
  output: matchOutput[];
  stop: number;
  total: number;
};

export async function getRelevantGamesFromForebet(
  start: number,
  addr: string = "",
  noStop: boolean = false
): Promise<relevantGamesOutput> {
  const driver = getDriver();
  const ret: relevantGamesOutput = { stop: 0, total: 0, output: [] };
  const output: matchOutput[] = [];
  try {
    const matchListReader = new MatchListReader(driver, start, noStop);
    await matchListReader.openList(addr);
    await matchListReader.consentToCookies();
    await matchListReader.clickMore();
    await matchListReader.compileLinkList();
    let idx = 0;
    for (const link of matchListReader.getLinks()) {
      idx++;
      const scraper = new DetailScraper(link, driver, idx);
      await scraper.loadPage();
      await scraper.get1X2();
      await scraper.getUnderOver();
      await scraper.getBts();
      output.push(scraper.getData());
    }
    ret.stop = matchListReader.getStop();
    ret.total = matchListReader.getTotal();
    ret.output = output;
  } finally {
    try {
      await driver.quit();
    } catch (err) {}
  }
  return ret;
}

