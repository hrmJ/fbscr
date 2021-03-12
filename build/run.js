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
(() => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = process.argv[2];
    const daysToMove = Number(process.argv[3]);
    let currentDay = moment(startDate);
    let output = [];
    for (let i = 0; i < daysToMove; i++) {
        const address = `https://www.forebet.com/en/football-predictions/predictions-1x2/${currentDay.format("Y-MM-DD")}`;
        console.log(address);
        const res = yield forebet_1.getRelevantGamesFromForebet(90, address, false);
        output = [...output, ...res.output];
        currentDay = currentDay.subtract(1, "days");
    }
    console.log(output);
    fs_1.writeFileSync(`forebet_${startDate}__${currentDay.format("Y-MM-DD")}.json`, JSON.stringify(output));
}))();
//# sourceMappingURL=run.js.map