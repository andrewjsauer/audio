/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';

const apiKey = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

const relationshipType = 'married';
const duration = '4 years';
const iterations = 5;
const outputFile = path.join(__dirname, '../experimentOutput/questions.txt');

const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
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

const generateAndAppendPrompt = async () => {
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];

  const prompt = `Generate a ${randomAdjective} question for a couple who are ${relationshipType} and have been together for ${duration}. The question should foster deeper understanding and connection, reflecting their relationship stage. Ensure it's concise (under 90 characters), clear, and does not include hashtags or comments, only the question itself.`;
  const systemPrompt = `As a relationship expert, generate a question that is based on the relationship type and duration. Adjust the tone and content to match the relationship stage and if appropriate incorporate concepts from leading couples experts like Dr. John and Julie Schwartz Gottman's.`;
  try {
    console.log(`Prompt: ${prompt}`);

    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      model: 'gpt-3.5-turbo',
    });

    const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
    const questionText = openAIQuestion?.replace(/^["']|["']$/g, '');

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
