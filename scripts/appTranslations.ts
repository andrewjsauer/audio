/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import fs from 'fs';
import path from 'path';
import readline from 'readline';

import { OpenAI } from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

const baseLocalePath = path.join(__dirname, '../../src/locales');
const baseFile = 'en.json';
const baseContent = JSON.parse(fs.readFileSync(path.join(baseLocalePath, baseFile), 'utf8'));

const languageMap: { [key: string]: string } = {
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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let translateAllForCurrentFile = false;

const askForConfirmation = async (text: string, targetLanguage: string): Promise<boolean> => {
  if (translateAllForCurrentFile) {
    return true;
  }

  return new Promise((resolve) => {
    rl.question(`Translate "${text}" into ${targetLanguage}? (y/n/all) `, (answer) => {
      if (answer.toLowerCase() === 'all') {
        translateAllForCurrentFile = true;
        resolve(true);
      } else {
        resolve(answer.toLowerCase() === 'y');
      }
    });
  });
};

const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const confirmed = await askForConfirmation(text, targetLanguage);
    if (!confirmed) {
      console.log('Translation skipped.');
      return '';
    }

    const chatCompletion = await openai.chat.completions.create({
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
    return content as string;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
};

const findMissingKeys = (baseObj: any, targetObj: any, prefix = ''): string[] => {
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

const getNestedValue = (obj: any, keys: string[]): any => {
  return keys.reduce((o, k) => (o || {})[k], obj);
};

const processFiles = async () => {
  for (const [key, languageTitle] of Object.entries(languageMap)) {
    if (key !== 'en') {
      translateAllForCurrentFile = false;

      const filePath = path.join(baseLocalePath, `${key}.json`);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');

      const keysToTranslate = findMissingKeys(baseContent, content);
      console.log('Keys to translate for', key, ':', keysToTranslate);

      for (const fullKey of keysToTranslate) {
        const keys = fullKey.split('.');
        const lastKey = keys.pop() as string;
        let nestedObj = content;

        for (const k of keys) {
          nestedObj[k] = nestedObj[k] || {};
          nestedObj = nestedObj[k];
        }

        nestedObj[lastKey] = await translateText(
          getNestedValue(baseContent, fullKey.split('.')),
          languageTitle,
        );
      }

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    }
  }
};

processFiles()
  .then(() => {
    console.log('Translation process complete.');
    rl.close();
  })
  .catch((error) => {
    console.error('An error occurred:', error);
    rl.close();
  });
