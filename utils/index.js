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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachePath = exports.writeAsync = exports.firstUpperCase = exports.upload = exports.exec = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = __importDefault(require("fs"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const exec = (cmd = '') => __awaiter(void 0, void 0, void 0, function* () {
    if (!cmd)
        return false;
    return new Promise((resolve, reject) => {
        shelljs_1.default.exec(cmd, function (code, stdout, stderr) {
            if (code !== 0) {
                console.log(chalk_1.default.red(`执行${cmd}失败:`));
                reject(stderr);
            }
            resolve(stdout);
        });
    });
});
exports.exec = exec;
function upload(host, port, path, Cookie, uploadFilePath) {
    return new Promise((resolve, reject) => {
        const boundaryKey = '----' + new Date().getTime();
        const options = {
            host,
            port,
            method: 'POST',
            path: path,
            headers: {
                'Content-Type': 'multipart/form-data',
                'Connection': 'keep-alive',
                'Cookie': Cookie,
            }
        };
        const req = http_1.default.request(options, function (res) {
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                console.log('body: ' + chunk);
            });
            res.on('end', function () {
                console.log('res end.');
            });
        });
        req.write(`--${boundaryKey}rn Content-Disposition: form-data; name="file"; filename="myTest.jpg"rn Content-Type: application/x-msdownload`);
        const fileStream = fs_1.default.createReadStream(uploadFilePath);
        fileStream.pipe(req, { end: false });
        fileStream.on('end', function (error) {
            req.end('rn--' + boundaryKey + '--');
            if (error) {
                console.log(error);
                reject();
            }
            else
                resolve(true);
        });
    });
}
exports.upload = upload;
const firstUpperCase = (str) => {
    return str.replace(str[0], str[0].toUpperCase());
};
exports.firstUpperCase = firstUpperCase;
function writeAsync(output, content) {
    return new Promise(((resolve, reject) => {
        output.write(content, (error => {
            if (error)
                reject(error);
            resolve(true);
        }));
    }));
}
exports.writeAsync = writeAsync;
function getCachePath() {
    return path_1.default.resolve(process.cwd(), 'node_modules/.cache/bcs-tools');
}
exports.getCachePath = getCachePath;
