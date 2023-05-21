import { ThenableWebDriver, By, until, WebElement } from "selenium-webdriver";
import { Browser, BrowserContext, Page } from "playwright";
const moment = require("moment");

type matchLink = {
  href: string;
  time: string;
};

export default class MatchListReader {
  private driver: BrowserContext;

  private hrefs: string[];

  private start: number;

  private stop: number;

  private total: number;

  private leagueView: boolean;

  private page: Page;

  constructor(
    driver: BrowserContext,
    start: number = 0,
    noStop: boolean = false,
    leagueView: boolean = false
  ) {
    this.driver = driver;
    this.start = start;
    this.stop = start + 100;
    this.leagueView = leagueView;
    if (noStop) {
      this.stop = 999999;
    }
  }

  async openList(addr: string = "") {
    this.page = await this.driver.newPage();
    await this.page.goto(
      addr ||
        "https://www.forebet.com/en/football-tips-and-predictions-for-today"
    );
  }

  async consentToCookies() {
    const consentLinkLocator = By.css(".fc-cta-consent");
    try {
      console.log("Clicking OK to cookies");
      await this.driver.wait(until.elementLocated(consentLinkLocator));
      const link = await this.driver.findElement(consentLinkLocator);
      await link.click();
      console.log("clicked ok");
    } catch (error) {
      console.log("Unable to click ok to cookies popup: ", error);
    }
  }

  async clickMore() {
    const moreLinkLocator = By.css("#mrows span");
    try {
      await this.driver.wait(until.elementLocated(moreLinkLocator), 7000);
    } catch (err) {}
    console.log("searched for morelink");
    try {
      const moreLink = await this.driver.findElement(moreLinkLocator);
      try {
        await this.driver.wait(until.elementLocated(moreLinkLocator), 7000);
      } catch (err) {}
      const actions = this.driver.actions({ async: true });
      await actions.move({ origin: moreLink }).perform();
      await moreLink.click();
      console.log("clicked");
      await this.driver.sleep(4000);
    } catch (err) {
      console.log("no morelink found");
    }
  }

  private async listLinksAndDates(): Promise<matchLink[]> {
    console.log("Listing all available matches");
    const selector = this.leagueView ? ".stat_link" : ".tnmscn";
    const links = await this.driver.findElements(By.css(selector));
    this.total = links.length;
    console.log(`found ${this.total}`);
    return await Promise.all(
      links.map(async (link: WebElement, idx): Promise<matchLink> => {
        const parent = await link.findElement(By.xpath("./../.."));
        const dateCont = this.leagueView
          ? await parent.findElement(
              By.xpath("preceding-sibling::*[1][self::tr]")
            )
          : await parent.findElement(By.css(".date_bah"));
        const time = await dateCont.getText();
        const href = await link.getAttribute("href");
        console.log(idx);
        return { time, href };
      })
    );
  }

  private async setHrefs(links: matchLink[]) {
    this.hrefs = links
      .filter((_, idx) => idx < this.stop && idx > this.start)
      .map((link) => link.href);
    console.log(`${this.hrefs.length} matches to scrape`);
  }

  async compileLinkList(addr = "") {
    let links = await this.listLinksAndDates();
    if (this.leagueView) {
      while (true) {
        await this.driver.get(`${addr}?start=${links.length}`);
        console.log(`Total collected: ${links.length}`);
        const newLinks = await this.listLinksAndDates();
        links = [...links, ...newLinks];
        if (!newLinks.length) {
          console.log("No more pages for this season");
          break;
        }
      }
    }
    this.setHrefs(links);
  }

  getLinks(): string[] {
    return this.hrefs;
  }

  getTotal(): number {
    return this.total;
  }

  getStop(): number {
    return this.stop;
  }
}
