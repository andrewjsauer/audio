/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

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
const outputFile = path.join(__dirname, '../experimentOutput/questions.txt');

const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const pastQuestions = ['What is your favorite memory of us?'];

const categories = ['thoughtful', 'playful', 'fun'];
const relationship = relationshipTypeMap[relationshipType];

const generateAndAppendPrompt = async () => {
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const prompt = `Create a daily question for ${relationship} that is engaging, thoughtful, and roughly 90 characters long.`;
  const systemPrompt = `You are an AI designed to generate ${randomCategory} and engaging daily questions for couples. Your questions should encourage meaningful conversations and help couples learn more about each other. Ensure that each question is clear, concise, and roughly 90 characters in length. Avoid previous questions: ${pastQuestions.join(
    ', ',
  )}.`;

  try {
    console.log(`Prompt: ${prompt}`);

    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-4o',
    });

    const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
    const questionText = openAIQuestion?.replace(/^["']|["']$/g, '');

    console.log(questionText);

    fs.appendFileSync(outputFile, `${questionText}\n`);
  } catch (error) {
    console.log('Error generating prompt', error);
  }
};

const runScript = async () => {
  try {
    fs.writeFileSync(outputFile, '');
    for (let i = 0; i < iterations; i++) {
      await generateAndAppendPrompt();
    }

    console.log('Completed.');
  } catch (error) {
    console.error('Error in runScript:', error);
  }
};

runScript();
