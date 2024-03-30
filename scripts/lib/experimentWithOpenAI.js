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
const pastQuestions = [];
const categories = ['thoughtful', 'playful'];
const generateAndAppendPrompt = () => __awaiter(void 0, void 0, void 0, function* () {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    // const prompt = `Generate a conversation starter about "${randomCategory}" for team members to share insights and personal stories. The question should facilitate deep understanding and connection, suitable for team-building exercises. Ensure it's open-ended to encourage detailed responses and is appropriate for a professional setting. Exclude questions similar to previously discussed topics: ${pastQuestions.join(
    //   ', ',
    // )}.`;
    const prompt = `Create a 90-character ${randomCategory} question for ${relationshipType} couples that is inspired by couple card games like 'Talking Hearts.' Avoid topics already covered: ${pastQuestions.join(', ')}.`;
    // const systemPrompt = `Drawing inspiration from team dynamics, interpersonal communication, and the engaging nature of couple conversation games like 'Talking Hearts,' generate a conversation starter relevant to "${randomCategory}." This question should guide team members to reveal personal experiences, values, or aspirations, contributing to a deeper mutual understanding within a professional setting. Ensure the question is open-ended for detailed discussions, promoting empathy, rapport, and a shared sense of purpose, while being sensitive to the professional context. Aim for a unique question that has not been addressed by previous topics: ${pastQuestions.join(
    //   ', ',
    // )}.`;
    // const systemPrompt = `Utilizing insights from team dynamics and interpersonal communication strategies, develop a conversation starter that encourages team members to explore and share their perspectives and experiences related to "${randomCategory}". This question should be crafted to deepen team connections through understanding personal values, life experiences, or views on work and growth. It must be open-ended, allowing for comprehensive responses, and crafted to fit within the context of a professional team-building session. Aim for a question that promotes empathy, rapport, and a sense of common purpose among team members.`;
    // const prompt = `Generate a ${randomAdjective} question for a couple who are ${relationshipType} and have been together for ${duration}. Keep the question under 90 characters. Avoid repetition from these past questions: ${pastQuestions.join(
    //   ', ',
    // )}.`;
    // const prompt = `Craft a ${randomAdjective} question for couples to uncover new depths in their relationship. Ensure the question is suitable for partners at any stage, from first dates to long-term unions. Keep it under 80 characters to maintain intrigue and avoid repeating any of these prior questions: ${pastQuestions.join(
    //   ', ',
    // )}.`;
    // const systemPrompt = `As a creator of Talking Hearts Conversation Cards, your task is to formulate a question that resonates with both the joy and depth of romantic partnerships. Depending on the category (playful or thoughtful), the question should offer a gateway to discovering hidden facets of each other's personalities and dreams. Tailor this to suit couples at any point in their journey together, making each question an opportunity to build stronger bonds and create cherished memories. Your question should be concise, inviting, and profound, capable of sparking conversations that traverse the spectrum of human emotion and companionship.`;
    // const systemPrompt = `As a relationship expert, craft a question that spans across therapeutic insights, fun elements, and unique experiences, tailored to the couple's relationship stage (${relationshipType}) and their journey (${duration}). Adapt the complexity and depth according to the relationship stage, creating a conducive space for meaningful interaction and joyous discovery.`;
    try {
        console.log(`Prompt: ${prompt}`);
        const chatCompletion = yield openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'gpt-4',
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
