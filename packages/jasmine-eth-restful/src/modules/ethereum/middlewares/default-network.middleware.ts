import {Injectable, NestMiddleware} from "@nestjs/common";
import {Request, Response} from "express";

@Injectable()
export default class DefaultNetworkMiddleware implements NestMiddleware<Request, Response> {
    use(req: Request, res: Response, next: () => void): any {
        const reg = new RegExp(/^\/[0-9]+\/.*$/);
        if (!reg.test(req.url)) {
            req.url = "/0" + req.url;
        }
        next();
    }
};
