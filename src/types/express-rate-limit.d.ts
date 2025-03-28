declare module 'express-rate-limit' {
    import { NextFunction, Request, Response } from 'express';

    interface Options {
        windowMs?: number;
        max?: number;
        message?: string | object;
        statusCode?: number;
        headers?: boolean;
        handler?: (req: Request, res: Response, next: NextFunction) => void;
        onLimitReached?: (req: Request, res: Response, options: Options) => void;
        skipFailedRequests?: boolean;
        skipSuccessfulRequests?: boolean;
        requestWasSuccessful?: (req: Request, res: Response) => boolean;
        skip?: (req: Request, res: Response) => boolean;
        keyGenerator?: (req: Request, res: Response) => string;
        store?: any;
    }

    function rateLimit(options?: Options): (req: Request, res: Response, next: NextFunction) => void;

    export default rateLimit;
} 