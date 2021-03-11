import { getRelevantGamesFromForebet } from "./forebet";
import { writeFileSync } from "fs";

(async () => {
  const startDate = process.argv[2];
  const daysToMove = process.argv[3];
  console.log(startDate, daysToMove);
  //const output = await getRelevantGamesFromForebet(
  //  99,
  //  "https://www.forebet.com/en/football-predictions/predictions-1x2/2021-03-09",
  //  true
  //);
  //console.log(output);
  //writeFileSync("scraped_offline.json", JSON.stringify(output.output));
})();

