import { getRelevantGamesFromForebet } from "./forebet";
import { writeFileSync } from "fs";
import { matchOutput } from "./forebet/DetailScraper";
import { Moment } from "moment";
const moment = require("moment");
import * as querystring from "querystring";
import request from "request";
import { config } from "dotenv";

config();

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

const scrapeLeague = async () => {
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
  let output: matchOutput[] = [];
  let seasonId = "";
  for (let i = 0; i < Math.abs(seasonsToMove); i++) {
    currentSeason = currentSeason.map((year) => year - 1);
    seasonId = currentSeason.join("-");
    console.log(`Scraping season ${seasonId}`);
    const res = await getRelevantGamesFromForebet(
      0,
      `${address}/${seasonId}`,
      true,
      true
    );
    output = [...output, ...res.output];
  }
  writeFileSync(
    `forebet_${league}_${seasonId}__${process.argv[2]}.json`,
    JSON.stringify(output)
  );
};

function notify() {
  request.post(
    {
      url: "https://api.simplepush.io/send",
      body: querystring.stringify({
        key: process.env.KEY,
        title: "HUOM!",
        msg: "Skreippi valmis!",
      }),
    },
    function (a: any, b: any, c: any) {}
  );
}

(async () => {
  if (process.argv.length > 4) {
    await scrapeLeague();
  } else if (process.argv.length > 3) {
    await scrapeDays();
  } else {
    await scrapeToday();
  }
  notify();
})();
