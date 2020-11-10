import { Request, Response } from "express";
import { getRelevantGamesFromForebet } from "./forebet";

/**
 * The name of this export must match the `--entry-point` option in
 * the deploy script.
 */
export default async function main(req: Request, res: Response) {
  const key = req.query.key;
  if (key !== process.env.APIKEY) {
    res.status(403).send("forbidden!");
  }
  const output = await getRelevantGamesFromForebet();
  res.status(200).json(output);
}
