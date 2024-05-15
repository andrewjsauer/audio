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
const relationshipTypeMap = {
    stillGettingToKnowEachOther: 'a couple who are still getting to know each other',
    dating: 'a couple who are just dating',
    inARelationship: 'a couple who is in relationship',
    engaged: 'a couple who is engaged',
    domesticPartnership: 'a domestic partnership couple',
    cohabiting: 'a cohabiting couple',
    longDistanceRelationship: 'a long distance couple',
    consensualNonMonogamousRelationship: 'a consensual non-monogamous relationship',
    inAnOpenRelationship: 'a couple in an open relationship',
    married: 'a married couple',
};
const relationshipType = 'married';
const duration = '4 years';
const iterations = 5;
const outputFile = path_1.default.join(__dirname, '../experimentOutput/questions.txt');
const outputDir = path_1.default.dirname(outputFile);
if (!fs_1.default.existsSync(outputDir)) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
}
const pastQuestions = ['What is your favorite memory of us?'];
const categories = ['thoughtful', 'playful', 'fun'];
const relationship = relationshipTypeMap[relationshipType];
const generateAndAppendPrompt = () => __awaiter(void 0, void 0, void 0, function* () {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const prompt = `Create a daily question for ${relationship} that is engaging, thoughtful, and roughly 90 characters long.`;
    const systemPrompt = `You are an AI designed to generate ${randomCategory} and engaging daily questions for couples. Your questions should encourage meaningful conversations and help couples learn more about each other. Ensure that each question is clear, concise, and roughly 90 characters in length. Avoid previous questions: ${pastQuestions.join(', ')}.`;
    try {
        console.log(`Prompt: ${prompt}`);
        const chatCompletion = yield openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt },
            ],
            model: 'gpt-4o',
        });
        const openAIQuestion = chatCompletion.choices[0].message.content;
        const questionText = openAIQuestion === null || openAIQuestion === void 0 ? void 0 : openAIQuestion.replace(/^["']|["']$/g, '');
        console.log(questionText);
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
