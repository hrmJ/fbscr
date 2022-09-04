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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const selenium_webdriver_1 = require("selenium-webdriver");
const chrome_1 = require("selenium-webdriver/chrome");
require("chromedriver");
const chromium = __importStar(require("chromium-version"));
const MatchListReader_1 = __importDefault(require("./forebet/MatchListReader"));
const DetailScraper_1 = __importDefault(require("./forebet/DetailScraper"));
exports.scrapeCols = [
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
const getDriver = () => {
    const isVisual = process.argv.some((arg) => arg === "visual");
    const options = isVisual ? new chrome_1.Options() : new chrome_1.Options().headless();
    return new selenium_webdriver_1.Builder()
        .forBrowser("chrome")
        .setChromeOptions(options
        .addArguments("--no-sandbox")
        .addArguments("--disable-dev-shm-usage")
        .setChromeBinaryPath(chromium.path))
        .build();
};
function getRelevantGamesFromForebet(start, addr = "", noStop = false, leagueView = false) {
    return __awaiter(this, void 0, void 0, function* () {
        const driver = getDriver();
        const ret = { stop: 0, total: 0, output: [] };
        const output = [];
        try {
            const matchListReader = new MatchListReader_1.default(driver, start, noStop, leagueView);
            yield matchListReader.openList(addr);
            yield matchListReader.consentToCookies();
            yield matchListReader.clickMore();
            yield matchListReader.compileLinkList(addr);
            let idx = 0;
            for (const link of matchListReader.getLinks()) {
                idx++;
                const scraper = new DetailScraper_1.default(link, driver, idx);
                yield scraper.loadPage();
                yield scraper.get1X2();
                yield scraper.getUnderOver();
                yield scraper.getBts();
                output.push(scraper.getData());
            }
            ret.stop = matchListReader.getStop();
            ret.total = matchListReader.getTotal();
            ret.output = output;
        }
        finally {
            try {
                yield driver.quit();
            }
            catch (err) { }
        }
        return ret;
    });
}
exports.getRelevantGamesFromForebet = getRelevantGamesFromForebet;
//# sourceMappingURL=forebet.js.map