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

const pastQuestions: any = [];

const categories = ['thoughtful', 'playful', 'fun'];

const generateAndAppendPrompt = async () => {
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  // const prompt = `Generate a conversation starter about "${randomCategory}" for team members to share insights and personal stories. The question should facilitate deep understanding and connection, suitable for team-building exercises. Ensure it's open-ended to encourage detailed responses and is appropriate for a professional setting. Exclude questions similar to previously discussed topics: ${pastQuestions.join(
  //   ', ',
  // )}.`;

  const prompt = `Create a 90-character ${randomCategory} question for ${relationshipType} couples that is inspired by couple card games like 'Talking Hearts.' Avoid topics already covered: ${pastQuestions.join(
    ', ',
  )}.`;

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

    const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'gpt-4',
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
