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
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
const openai_1 = require("openai");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const apiKey = process.env.OPENAI_API_KEY;
const openai = new openai_1.OpenAI({ apiKey });
const relationshipType = 'married';
const duration = '4 years';
const iterations = 5;
const outputFile = path_1.default.join(__dirname, '../experimentOutput/questions.txt');
const outputDir = path_1.default.dirname(outputFile);
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
}
const adjectives = [
    'insightful',
    'thought-provoking',
    'fun',
    'creative',
    'unique',
    'engaging',
    'reflective',
    'heartwarming',
    'challenging',
    'humorous',
    'intimate',
    'empathetic',
    'curious',
    'romantic',
    'practical',
    'inspirational',
];
const generateAndAppendPrompt = () => __awaiter(void 0, void 0, void 0, function* () {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const prompt = `Generate a ${randomAdjective} question under 90 characters for a couple who are ${relationshipType} and have been together for ${duration}. Question only. No hashtags or additional text.`;
    const systemPrompt = `As a relationship expert, generate a question that is based on the relationship type and duration. The question should be appropriate for the stage of the relationship, should encourage sharing and exploration. Adjust the tone and content to match the relationship stage and if appropriate incorporate concepts from Dr. John and Julie Schwartz Gottman's communication techniques.`;
    try {
        console.log(`Prompt: ${prompt}`);
        const chatCompletion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            model: 'gpt-3.5-turbo',
        });
        const openAIQuestion = chatCompletion.choices[0].message.content;
        const questionText = openAIQuestion === null || openAIQuestion === void 0 ? void 0 : openAIQuestion.replace(/^["']|["']$/g, '');
        fs_1.default.appendFileSync(outputFile, `${questionText}\n`);
    }
    catch (error) {
        console.log('Error generating prompt', error);
    }
});
const runScript = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fs_1.default.writeFileSync(outputFile, '');
        for (let i = 0; i < iterations; i++) {
            yield generateAndAppendPrompt();
        }
        console.log('Completed.');
    }
    catch (error) {
        console.error('Error in runScript:', error);
    }
});
runScript();
