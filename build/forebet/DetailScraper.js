"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
class DetailScraper {
    constructor(link, driver, idx) {
        this.link = "";
        this.data = {
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
        this.link = link;
        this.driver = driver;
        this.idx = idx;
    }
    loadPage() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Loading detail page ${this.idx}`);
            yield this.driver.get(this.link);
        });
    }
    openTab(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const link = !selector.match(/#\d/)
                    ? yield this.driver.findElement(selenium_webdriver_1.By.css(selector))
                    : yield this.driver.findElement(selenium_webdriver_1.By.id(selector.replace("#", "")));
                yield link.click();
                return true;
            }
            catch (err) {
                console.log(`unable to click ${selector}`);
            }
            return false;
        });
    }
    getLeagueAndCountry() {
        return __awaiter(this, void 0, void 0, function* () {
            const div = yield this.driver.findElement(selenium_webdriver_1.By.css(".shortagDiv img"));
            let raw = yield div.getAttribute("onclick");
            const re = new RegExp("'([^']+)'", "g");
            if (raw) {
                const [country, league] = (raw.replace("''", " ").match(re) || ["", "", ""])
                    .filter((_, i) => i < 2)
                    .map((m) => m.replace(/^'(.*)'$/, "$1"));
                this.data.country = country;
                this.data.league = league;
            }
        });
    }
    getElementText(selector) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const el = yield this.driver.findElement(selenium_webdriver_1.By.css(selector));
                return yield el.getText();
            }
            catch (err) {
                return "";
            }
        });
    }
    getTeams() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data.homeTeam = yield this.getElementText(".homeTeam");
            this.data.awayTeam = yield this.getElementText(".awayTeam");
        });
    }
    get1x2Props() {
        return __awaiter(this, void 0, void 0, function* () {
            this.data.pred1 = yield this.getElementText(".tr_0 .fprc > span:nth-child(1)");
            this.data.predx = yield this.getElementText(".tr_0 .fprc > span:nth-child(2)");
            this.data.pred2 = yield this.getElementText(".tr_0 .fprc > span:nth-child(3)");
        });
    }
    getOdds() {
        return __awaiter(this, void 0, void 0, function* () {
            const tipOdd = yield this.getElementText(".tr_0 .lscrsp");
            let H = "", X = "", A = "";
            try {
                const oddsCont = yield this.driver.findElement(selenium_webdriver_1.By.css(".tr_0 .haodd"));
                const oddsText = yield oddsCont.getAttribute("innerText");
                [H, X, A] = oddsText
                    .split("\n")
                    .filter((t) => t && !["1", "-1"].includes(t));
            }
            catch (err) {
                console.log("unable to get odds");
            }
            this.data = Object.assign(Object.assign({}, this.data), { tipOdd, H, X, A });
        });
    }
    get1X2() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting 1x2 data");
            if (!(yield this.openTab("#1x2_t_butt"))) {
                return null;
            }
            yield this.getLeagueAndCountry();
            yield this.getTeams();
            yield this.get1x2Props();
            this.data.forebet = yield this.getElementText(".tr_0 .forepr");
            this.data.forebetEventTime = yield this.getElementText(".date_bah");
            this.data.exScore = yield this.getElementText(".tr_0 .ex_sc");
            this.data.score = yield this.getElementText(".tr_0 .l_scr");
            this.data.avg = yield this.getElementText(".tr_0 .avg_sc");
            yield this.getOdds();
        });
    }
    getUnderOver() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting under-over data");
            if (!(yield this.openTab("#uo_t_butt"))) {
                return null;
            }
            this.data.propinUnder = yield this.getElementText("#uo_table .tr_0 .fprc > span:first-child");
            this.data.propinOver = yield this.getElementText("#uo_table .tr_0 .fprc > span:last-child");
            this.data.forPredicUO = yield this.getElementText("#uo_table .tr_0 .predict");
            this.data.forUoOdds = yield this.getElementText("#uo_table .tr_0 > .bigOnly");
        });
    }
    getBts() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Getting both to score data");
            if (!(yield this.openTab("#bts_t_butt"))) {
                return null;
            }
            this.data.btsNo = yield this.getElementText("#bts_table .tr_0 .fpr");
            this.data.btsYes = yield this.getElementText("#bts_table .tr_0 .fprc > span:last-child");
            this.data.btsOdd = yield this.getElementText("#bts_table .tr_0 > .bigOnly");
        });
    }
    getData() {
        return this.data;
    }
}
exports.default = DetailScraper;
//# sourceMappingURL=DetailScraper.js.map