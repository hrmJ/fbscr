import { ThenableWebDriver, By } from "selenium-webdriver";

export type matchOutput = {
  homeTeam: string;
  awayTeam: string;
  pred1: string;
  predx: string;
  pred2: string;
  forebet: string;
  exScore: string;
  score: string;
  avg: string;
  tipOdd: string;
  H: string;
  X: string;
  A: string;
  kelly: string;
  forebetEventTime: string;
  propinUnder: string;
  propinOver: string;
  forPredicUO: string;
  forUoOdds: string;
  btsNo: string;
  btsYes: string;
  btsOdd: string;
  country: string;
  league: string;
};

export default class DetailScraper {
  private link: string = "";

  private data: matchOutput = {
    homeTeam: "",
    awayTeam: "",
    pred1: "",
    predx: "",
    pred2: "",
    forebet: "",
    exScore: "",
    score: "",
    avg: "",
    tipOdd: "",
    H: "",
    X: "",
    A: "",
    kelly: "",
    forebetEventTime: "",
    propinUnder: "",
    propinOver: "",
    forPredicUO: "",
    forUoOdds: "",
    btsNo: "",
    btsYes: "",
    btsOdd: "",
    country: "",
    league: "",
  };

  private driver: ThenableWebDriver;

  private idx: number;

  constructor(link: string, driver: ThenableWebDriver, idx: number) {
    this.link = link;
    this.driver = driver;
    this.idx = idx;
  }

  async loadPage() {
    console.log(`Loading detail page ${this.idx}`);
    await this.driver.get(this.link);
  }

  private async openTab(selector: string): Promise<boolean> {
    try {
      const link = !selector.match(/#\d/)
        ? await this.driver.findElement(By.css(selector))
        : await this.driver.findElement(By.id(selector.replace("#", "")));
      await link.click();
      return true;
    } catch (err) {
      console.log(`unable to click ${selector}`);
    }
    return false;
  }

  async getLeagueAndCountry() {
    const div = await this.driver.findElement(By.css(".shortagDiv img"));
    let raw = await div.getAttribute("onclick");
    const re = new RegExp("'([^']+)'", "g");
    if (raw) {
      const [country, league] = (
        raw.replace("''", " ").match(re) || ["", "", ""]
      )
        .filter((_, i) => i < 2)
        .map((m) => m.replace(/^'(.*)'$/, "$1"));
      this.data.country = country;
      this.data.league = league;
    }
  }

  async getElementText(selector: string) {
    try {
      const el = await this.driver.findElement(By.css(selector));
      return await el.getText();
    } catch (err) {
      return "";
    }
  }

  async getTeams() {
    this.data.homeTeam = await this.getElementText(".homeTeam");
    this.data.awayTeam = await this.getElementText(".awayTeam");
  }

  async get1x2Props() {
    this.data.pred1 = await this.getElementText(
      ".tr_0 .fprc > span:nth-child(1)"
    );
    this.data.predx = await this.getElementText(
      ".tr_0 .fprc > span:nth-child(2)"
    );
    this.data.pred2 = await this.getElementText(
      ".tr_0 .fprc > span:nth-child(3)"
    );
  }

  async getOdds() {
    const tipOdd = await this.getElementText(".tr_0 .lscrsp");
    let H = "",
      X = "",
      A = "";
    try {
      const oddsCont = await this.driver.findElement(By.css(".tr_0 .haodd"));
      const oddsText = await oddsCont.getAttribute("innerText");
      [H, X, A] = oddsText
        .split("\n")
        .filter((t: string) => t && !["1", "-1"].includes(t));
    } catch (err) {
      console.log("unable to get odds");
    }
    this.data = { ...this.data, tipOdd, H, X, A };
  }

  async get1X2() {
    console.log("Getting 1x2 data");
    if (!(await this.openTab("#1x2_t_butt"))) {
      return null;
    }
    await this.getLeagueAndCountry();
    await this.getTeams();
    await this.get1x2Props();
    this.data.forebet = await this.getElementText(".tr_0 .forepr");
    this.data.forebetEventTime = await this.getElementText(".date_bah");
    this.data.exScore = await this.getElementText(".tr_0 .ex_sc");
    this.data.score = await this.getElementText(".tr_0 .l_scr");
    this.data.avg = await this.getElementText(".tr_0 .avg_sc");
    await this.getOdds();
  }

  async getUnderOver() {
    console.log("Getting under-over data");
    if (!(await this.openTab("#uo_t_butt"))) {
      return null;
    }
    this.data.propinUnder = await this.getElementText(
      "#uo_table .tr_0 .fpr > span:first-child"
    );
    this.data.propinOver = await this.getElementText(
      "#uo_table .tr_0 .fprc > span:last-child"
    );
    this.data.forPredicUO = await this.getElementText(
      "#uo_table .tr_0 .predict"
    );
    this.data.forUoOdds = await this.getElementText(
      "#uo_table .tr_0 > .bigOnly"
    );
  }

  async getBts() {
    console.log("Getting both to score data");
    if (!(await this.openTab("#bts_t_butt"))) {
      return null;
    }
    this.data.btsNo = await this.getElementText("#bts_table .tr_0 .fpr");
    this.data.btsYes = await this.getElementText(
      "#bts_table .tr_0 .fprc > span:last-child"
    );
    this.data.btsOdd = await this.getElementText("#bts_table .tr_0 > .bigOnly");
  }

  getData(): matchOutput {
    return this.data;
  }
}

