import { Request, Response } from "express";
import { withBrowser } from "./browser";
import { getRelevantGamesFromForebet } from "./forebet";

/**
 * The name of this export must match the `--entry-point` option in
 * the deploy script.
 */
export default async function main(req: Request, res: Response) {
  const output = await getRelevantGamesFromForebet();
  res.status(200).send(output);
}
