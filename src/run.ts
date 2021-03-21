import { getRelevantGamesFromForebet } from "./forebet";
import { writeFileSync } from "fs";
import { matchOutput } from "./forebet/DetailScraper";
import { Moment } from "moment";
const moment = require("moment");

const scrapeDays = async () => {
  const startDate = process.argv[2];
  const daysToMove = Number(process.argv[3]);
  let currentDay: Moment = moment(startDate);
  let output: matchOutput[] = [];
  for (let i = 0; i < Math.abs(daysToMove); i++) {
    const address = `https://www.forebet.com/en/football-predictions/predictions-1x2/${currentDay.format(
      "Y-MM-DD"
    )}`;
    console.log(address);
    const res = await getRelevantGamesFromForebet(0, address, true);
    output = [...output, ...res.output];
    currentDay =
      daysToMove < 0
        ? currentDay.subtract(1, "days")
        : currentDay.add(1, "days");
  }
  console.log(output);
  writeFileSync(
    `forebet_${startDate}__${currentDay.format("Y-MM-DD")}.json`,
    JSON.stringify(output)
  );
};

const scrapeToday = async () => {
  const address = `https://www.forebet.com/en/football-tips-and-predictions-for-today`;
  const res = await getRelevantGamesFromForebet(0, address, true);
  //const today = moment().format("Y-MM-DD");
  writeFileSync(`today.json`, JSON.stringify(res.output));
};

(async () => {
  if (process.argv.length > 3) {
    scrapeDays();
  } else {
    scrapeToday();
  }
})();

