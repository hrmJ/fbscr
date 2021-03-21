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
const moment = require("moment");
class MatchListReader {
    constructor(driver, start = 0, noStop = false) {
        this.driver = driver;
        this.start = start;
        this.stop = start + 100;
        if (noStop) {
            this.stop = 999999;
        }
    }
    openList(addr = "") {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.driver.get(addr ||
                "https://www.forebet.com/en/football-tips-and-predictions-for-today");
        });
    }
    consentToCookies() {
        return __awaiter(this, void 0, void 0, function* () {
            const consentLinkLocator = selenium_webdriver_1.By.css("#close-cc-bar");
            try {
                console.log("Clicking OK to cookies");
                yield this.driver.wait(selenium_webdriver_1.until.elementLocated(consentLinkLocator));
                const link = yield this.driver.findElement(consentLinkLocator);
                yield link.click();
                console.log("clicked ok");
            }
            catch (error) {
                console.log("Unable to click ok to cookies popup: ", error);
            }
        });
    }
    clickMore() {
        return __awaiter(this, void 0, void 0, function* () {
            const moreLinkLocator = selenium_webdriver_1.By.css("#mrows span");
            try {
                yield this.driver.wait(selenium_webdriver_1.until.elementLocated(moreLinkLocator), 7000);
            }
            catch (err) { }
            console.log("searched for morelink");
            try {
                const moreLink = yield this.driver.findElement(moreLinkLocator);
                try {
                    yield this.driver.wait(selenium_webdriver_1.until.elementLocated(moreLinkLocator), 7000);
                }
                catch (err) { }
                const actions = this.driver.actions({ async: true });
                yield actions.move({ origin: moreLink }).perform();
                yield moreLink.click();
                console.log("clicked");
                yield this.driver.sleep(4000);
            }
            catch (err) {
                console.log("no morelink found");
            }
        });
    }
    listLinksAndDates() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Listing all available matches");
            const links = yield this.driver.findElements(selenium_webdriver_1.By.css(".tnmscn"));
            this.total = links.length;
            console.log(`found ${this.total}`);
            return yield Promise.all(links.map((link) => __awaiter(this, void 0, void 0, function* () {
                const parent = yield link.findElement(selenium_webdriver_1.By.xpath("./../.."));
                const dateCont = yield parent.findElement(selenium_webdriver_1.By.css(".date_bah"));
                const time = yield dateCont.getText();
                const href = yield link.getAttribute("href");
                return { time, href };
            })));
        });
    }
    setHrefs(links) {
        return __awaiter(this, void 0, void 0, function* () {
            this.hrefs = links
                .filter((_, idx) => idx < this.stop && idx > this.start)
                .map((link) => link.href);
            console.log(`${this.hrefs.length} matches to scrape`);
        });
    }
    compileLinkList() {
        return __awaiter(this, void 0, void 0, function* () {
            const links = yield this.listLinksAndDates();
            this.setHrefs(links);
        });
    }
    getLinks() {
        return this.hrefs;
    }
    getTotal() {
        return this.total;
    }
    getStop() {
        return this.stop;
    }
}
exports.default = MatchListReader;
//# sourceMappingURL=MatchListReader.js.map