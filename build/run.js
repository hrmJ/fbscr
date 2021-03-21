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
const forebet_1 = require("./forebet");
const fs_1 = require("fs");
const moment = require("moment");
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
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (process.argv.length > 3) {
        scrapeDays();
    }
    else {
        scrapeToday();
    }
}))();
//# sourceMappingURL=run.js.map