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
const forebet_1 = require("./forebet");
const fs_1 = require("fs");
const moment = require("moment");
const querystring = __importStar(require("querystring"));
const request_1 = __importDefault(require("request"));
const dotenv_1 = require("dotenv");
dotenv_1.config();
const scrapeDays = () => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = process.argv[2];
    const daysToMove = Number(process.argv[3]);
    let currentDay = moment(startDate);
    let output = [];
    for (let i = 0; i < Math.abs(daysToMove); i++) {
        const address = `https://www.forebet.com/en/football-predictions/predictions-1x2/${currentDay.format("Y-MM-DD")}`;
        console.log(address);
        const res = yield forebet_1.getRelevantGamesFromForebet(0, address, true);
        output = [...output, ...res.output];
        currentDay =
            daysToMove < 0
                ? currentDay.subtract(1, "days")
                : currentDay.add(1, "days");
    }
    console.log(output);
    fs_1.writeFileSync(`forebet_${startDate}__${currentDay.format("Y-MM-DD")}.json`, JSON.stringify(output));
});
const scrapeToday = () => __awaiter(void 0, void 0, void 0, function* () {
    const address = `https://www.forebet.com/en/football-tips-and-predictions-for-today`;
    const res = yield forebet_1.getRelevantGamesFromForebet(0, address, true);
    fs_1.writeFileSync(`today.json`, JSON.stringify(res.output));
});
const scrapeLeague = () => __awaiter(void 0, void 0, void 0, function* () {
    const address = process.argv[4].replace(/\/results\/\d+-\d+/, "/results");
    const league = process.argv[4]
        .replace(/.*\/([^\/]+)\/([^\/]+)\/results\/.*/, "$1__$2")
        .replace("-and", "")
        .replace("-for-", "")
        .replace("-tips-", "")
        .replace("predictions", "")
        .replace("football", "");
    console.log(`SCRAPING a league's history: ${league}`);
    const seasonsToMove = Number(process.argv[3]);
    const seasonMatch = process.argv[2].match(/(\d+)-(\d+)/);
    if (!seasonMatch || seasonMatch.length < 3) {
        console.log("Anna lähtökausi muodossa 2020-2021");
        return null;
    }
    let currentSeason = [Number(seasonMatch[1]) + 1, Number(seasonMatch[2]) + 1];
    let output = [];
    let seasonId = "";
    for (let i = 0; i < Math.abs(seasonsToMove); i++) {
        currentSeason = currentSeason.map((year) => year - 1);
        seasonId = currentSeason.join("-");
        console.log(`Scraping season ${seasonId}`);
        const res = yield forebet_1.getRelevantGamesFromForebet(0, `${address}/${seasonId}`, true, true);
        output = [...output, ...res.output];
    }
    fs_1.writeFileSync(`forebet_${league}_${seasonId}__${process.argv[2]}.json`, JSON.stringify(output));
});
function notify() {
    request_1.default.post({
        url: "https://api.simplepush.io/send",
        body: querystring.stringify({
            key: process.env.KEY,
            title: "HUOM!",
            msg: "Skreippi valmis!",
        }),
    }, function (a, b, c) { });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (process.argv.length > 4) {
        yield scrapeLeague();
    }
    else if (process.argv.length > 3) {
        yield scrapeDays();
    }
    else {
        yield scrapeToday();
    }
    notify();
}))();
//# sourceMappingURL=run.js.map