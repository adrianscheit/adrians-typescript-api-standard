import http from "http";
import { jsonExchangeServiceAgent } from "./api";
import { CustomerContext } from "../common/api";

http.createServer(async (req, res) => {
    console.log(req.method, req.url, req.headers);
    const customerContext: CustomerContext = { userName: req.headers.authorization! };
    const key = jsonExchangeServiceAgent.getKeyIfMatch(req);
    if (key) {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', async () => {
            try {
                const response = JSON.stringify(await jsonExchangeServiceAgent.handleRequest(key, JSON.parse(body), customerContext));
                res.writeHead(200, { 'Content-Type': 'application/json' })
                res.end(response);
            } catch (err) {
                res.writeHead(400);
                res.end((err as Error).message ?? err);
            }
        });
        return;
    }
    res.writeHead(404);
    res.end();
}).listen(8080, () => {
    console.log('Listening at port 8080');
});