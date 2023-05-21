//
import { BrowserContext, Page } from "playwright";

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

  getPage() {
    return this.page;
  }

  async openList(addr: string = "") {
    this.page = await this.driver.newPage();
    await this.page.goto(
      addr ||
        "https://www.forebet.com/en/football-tips-and-predictions-for-today"
    );
  }

  async consentToCookies() {
    const consentLinkLocator = ".fc-cta-consent";
    try {
      console.log("Clicking OK to cookies");
      const link = await this.page.waitForSelector(consentLinkLocator);
      await link.click();
      console.log("clicked ok");
    } catch (error) {
      console.log("Unable to click ok to cookies popup: ", error);
    }
  }

  async clickMore() {
    const moreLinkLocator = "#mrows span";
    try {
      const moreLink = await this.page.waitForSelector(moreLinkLocator);
      await moreLink.click();
      console.log("clicked 'more'... ");
    } catch (err) {
      console.log("no morelink found");
    }
  }

  private async listLinksAndDates(): Promise<matchLink[]> {
    console.log("Listing all available matches");
    const selector = this.leagueView ? ".stat_link" : ".tnmscn";
    await this.page.waitForSelector(selector);
    const links = await this.page.$$(selector);
    this.total = links.length;
    return await Promise.all(
      links.map(async (link, idx): Promise<matchLink> => {
        const parent = await link?.$("xpath=./../..");
        const dateCont = this.leagueView
          ? await parent?.$("xpath=preceding-sibling::*[1][self::tr]")
          : await parent?.$(".date_bah");
        const time = (await dateCont?.textContent()) ?? "";
        const href = (await link.getAttribute("href")) ?? "";
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
        await this.page.goto(`${addr}?start=${links.length}`);
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
