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
function main(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = req.query.key;
        const start = parseInt(req.query.start);
        if (key !== process.env.APIKEY) {
            res.status(403).send("forbidden!");
        }
        console.log(start);
        const json = yield forebet_1.getRelevantGamesFromForebet(start);
        res.status(200).json(json);
    });
}
exports.default = main;
//# sourceMappingURL=main.js.map