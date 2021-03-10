import { getRelevantGamesFromForebet } from "./forebet";
import { writeFileSync } from "fs";

(async () => {
  const output = await getRelevantGamesFromForebet(
    0,
    "https://www.forebet.com/en/football-tips-and-predictions-for-today"
  );
  console.log(output);
  writeFileSync("scraped_offline.json", JSON.stringify(output.output));
})();

