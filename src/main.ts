import * as https from "https";
import md5 = require("md5");
import {appId, appSecret} from './private';

type ErrorMap = {
    [key: string]: string
}
const errorMap: ErrorMap = {
    '52001': '请求超时，请重试',
    '52002': '系统错误，请重试',
    '52003': '未授权用户',
    '54000': '必填参数为空',
    '54001': '签名错误',
    '54003': '访问频率受限',
    '54004': '账户余额不足',
    '54005': '长query请求频繁',
    '58000': '客户端IP非法',
    '58001': '译文语言方向不支持',
    '58002': '服务当前已关闭',
    '90107': '认证未通过或未生效'
}

export const translate = (word: string) => {
    const salt = Math.random().toString()
    const sign = md5(appId + word + salt + appSecret)
    let from, to;

    if (/[a-zA-Z]/.test(word[0])) {
        // 英译中
        from = 'en';
        to = 'zh';
    } else {
        // 中译英
        from = 'zh';
        to = 'en';
    }

    const query = new URLSearchParams({
        q: word,
        appid: appId,
        from,
        to,
        salt,
        sign
    }).toString();

    const options = {
        hostname: 'fanyi-api.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?' + query,
        method: 'GET'
    };

    const request = https.request(options, (response) => {
        const array: Buffer[] = []
        response.on('data', (d) => {
            array.push(d)
        });
        response.on('end', () => {
            const string = Buffer.concat(array).toString();
            // console.log(string);
            type TranslateResult = {
                error_code?: string,
                error_msg?: string,
                from: string,
                to: string,
                trans_result: { src: string, dst: string }[]
            }
            const obj: TranslateResult = JSON.parse(string)
            if (obj.error_code) {
                console.error(errorMap[obj.error_code] || obj.error_msg);
                process.exit(2);
            } else {
                obj.trans_result.map(item => {
                    console.log(item.dst);
                });
                process.exit(0)
            }
        })
    });

    request.on('error', (e) => {
        console.error(e);
    });
    request.end();
}