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
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const readline_1 = __importDefault(require("readline"));
const openai_1 = require("openai");
const apiKey = process.env.OPENAI_API_KEY;
const openai = new openai_1.OpenAI({ apiKey });
const baseLocalePath = path_1.default.join(__dirname, '../appStoreTranslations');
const baseFile = 'en.json';
const baseContent = JSON.parse(fs_1.default.readFileSync(path_1.default.join(baseLocalePath, baseFile), 'utf8'));
const languageMap = {
    ar: 'Arabic',
    bn: 'Bengali',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    hi: 'Hindi',
    it: 'Italian',
    ja: 'Japanese',
    ko: 'Korean',
    pt: 'Portuguese',
    ru: 'Russian',
    'zh-CN': 'Simplified Chinese',
};
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout,
});
let translateAllForCurrentFile = false;
const askForConfirmation = (text, targetLanguage) => __awaiter(void 0, void 0, void 0, function* () {
    if (translateAllForCurrentFile) {
        return true;
    }
    return new Promise((resolve) => {
        rl.question(`Translate "${text}" into ${targetLanguage}? (y/n/all) `, (answer) => {
            if (answer.toLowerCase() === 'all') {
                translateAllForCurrentFile = true;
                resolve(true);
            }
            else {
                resolve(answer.toLowerCase() === 'y');
            }
        });
    });
});
const translateText = (text, targetLanguage) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const confirmed = yield askForConfirmation(text, targetLanguage);
        if (!confirmed) {
            console.log('Translation skipped.');
            return '';
        }
        const chatCompletion = yield openai.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `Translate the following text into ${targetLanguage}`,
                },
                { role: 'user', content: text },
            ],
            model: 'gpt-3.5-turbo',
        });
        const { content } = chatCompletion.choices[0].message;
        return content;
    }
    catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
});
const findMissingKeys = (baseObj, targetObj, prefix = '') => {
    return Object.keys(baseObj).flatMap((key) => {
        const newPrefix = prefix ? `${prefix}.${key}` : key;
        if (typeof baseObj[key] === 'object' && baseObj[key] !== null) {
            return findMissingKeys(baseObj[key], targetObj[key] || {}, newPrefix);
        }
        if (!targetObj || !Object.prototype.hasOwnProperty.call(targetObj, key)) {
            return [newPrefix];
        }
        return [];
    });
};
const getNestedValue = (obj, keys) => {
    return keys.reduce((o, k) => (o || {})[k], obj);
};
const processFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const [key, languageTitle] of Object.entries(languageMap)) {
        if (key !== 'en') {
            translateAllForCurrentFile = false;
            const filePath = path_1.default.join(baseLocalePath, `${key}.json`);
            const content = JSON.parse(fs_1.default.readFileSync(filePath, 'utf8') || '{}');
            const keysToTranslate = findMissingKeys(baseContent, content);
            console.log('Keys to translate for', key, ':', keysToTranslate);
            for (const fullKey of keysToTranslate) {
                const keys = fullKey.split('.');
                const lastKey = keys.pop();
                let nestedObj = content;
                for (const k of keys) {
                    nestedObj[k] = nestedObj[k] || {};
                    nestedObj = nestedObj[k];
                }
                nestedObj[lastKey] = yield translateText(getNestedValue(baseContent, fullKey.split('.')), languageTitle);
            }
            fs_1.default.writeFileSync(filePath, JSON.stringify(content, null, 2));
        }
    }
});
processFiles()
    .then(() => {
    console.log('Translation process complete.');
    rl.close();
})
    .catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
});
