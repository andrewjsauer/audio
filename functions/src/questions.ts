import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { defineSecret } from 'firebase-functions/params';

import { v4 as uuidv4 } from 'uuid';
import { OpenAI } from 'openai';

const openApiKey = defineSecret('OPEN_AI_API_KEY');

type RelationshipType =
  | 'stillGettingToKnowEachOther'
  | 'dating'
  | 'inARelationship'
  | 'engaged'
  | 'domesticPartnership'
  | 'cohabiting'
  | 'longDistanceRelationship'
  | 'consensualNonMonogamousRelationship'
  | 'inAnOpenRelationship'
  | 'married';

const relationshipTypeMap: { [key in RelationshipType]: string } = {
  stillGettingToKnowEachOther: 'Still Getting to Know Each Other',
  dating: 'Dating',
  inARelationship: 'In a Relationship',
  engaged: 'Engaged',
  domesticPartnership: 'Domestic Partnership',
  cohabiting: 'Cohabiting',
  longDistanceRelationship: 'Long Distance Relationship',
  consensualNonMonogamousRelationship: 'Consensual Non-monogamous Relationship',
  inAnOpenRelationship: 'Open Relationship',
  married: 'Married',
};

const defaultQuestions = [
  'What is your partner incredibly good at?',
  "What's something important you've never told your partner?",
  'What is a fun tradition you would like to start with your partner?',
  'If you could go on any trip next year, what would it be?',
  'If your partner were to gift you a fully "you" day, what would it look like?',
  'What is a small thing your partner does that makes you happy?',
  "What warm childhood memory comes to mind that your partner doesn't know?",
  'What was your first impression of your partner, and how has it changed?',
  'What important lesson has this relationship taught you?',
  'What are some things you find most sexy in your partner?',
  'How have your dynamics changed, grown, or evolved since meeting?',
  'What qualities do you most admire in your partner?',
  'If you could choose any superpower to enhance your relationship, what would it be?',
  'What is something you want more of in your daily life?',
  "If you could pass three of your partner's genes along to your kids, what would they be?",
  'How do you both handle disagreements or conflicts?',
  'What three countries would you love to spend 3+ months in before you die?',
  'What shared goal would you like to achieve with your partner?',
  'What is something you admire about your partner?',
  'What is a funny or quirky habit of your partner that makes you happy?',
  'What is the ultimate dream vacation you want to take with your partner?',
  "What's your favorite date you've been on together?",
  "What's something very unique that you love about your partner?",
  'How do you prefer to manage stress in your relationship?',
  'What is your favorite outfit that your partner wears?',
  'If you could take three university classes what would you take?',
  'What is your favorite thing about your partner?',
  'What new habit would you really love to adopt together?',
  'Who are three of your heroes or inspirations and why?',
  'What do you want to do with your partner the very next time you see each other?',
  'If you could go together to see 1-3 musicians live, who would they be?',
  'What is your favorite memory of your partner?',
  'What does your absolute perfect day look like?',
  'What are some things that keep your romance alive and healthy?',
  "What are two dates you'd like to go on?",
  'What is something you very deeply wish you had more time for daily or weekly?',
  "What is something new you'd like to try together?",
  "What's something intimate you want to try with your partner?",
  "What is something you want to tell your partner that you're really sorry for?",
  'What is your most cherished tradition, celebration, or ritual as a couple?',
  'What is something you want your partner to teach you?',
  'What three things do you appreciate most about your partner?',
  'What is something you want to do with your partner?',
  'What do you most love doing for your partner?',
  'What does your dream house look like?',
  'Which friends do you wish you would hang out with more often together?',
  'What movie would you like to watch together with some popcorn and hot cocoa?',
  'How do you show love and affection to each other?',
  'What outdoor activity would you love to do together next week?',
  'What is something you want to learn about your partner?',
  'What have been three of your proudest moments?',
  'What do you really want to do this weekend?',
  'How has your partner positively influenced your life?',
  'Where would you love to live with together for 3 months next year?',
  'What do you think your partner wants more of?',
  "How have you supported each other's goals?",
  'What challenge have you overcome and how has it changed your relationship?',
  'What have you learned about love and relationships from being with your partner?',
  'Which dish or treat has your partner made that you miss badly',
  'What activity, hobby, or sport have you never done and would love to try together?',
  "What is the best piece of advice you've received about relationships?",
  'What friend do you wish you would personally reconnect with?',
];

export const generateQuestion = functions
  .runWith({ secrets: [openApiKey] })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Endpoint requires authentication!');
    }

    const { questionIndex, partnershipData, partnerData, userData, usersLanguage } = data;
    functions.logger.info(`Data: ${JSON.stringify(data)}`);

    const db = admin.firestore();
    let questionText;

    const apiKey = openApiKey.value();
    const openai = new OpenAI({ apiKey });

    const languageMap: { [key: string]: string } = {
      en: 'English',
      es: 'Spanish',
      zhCN: 'Simplified Chinese',
      hi: 'Hindi',
      ar: 'Arabic',
      bn: 'Bengali',
      pt: 'Portuguese',
      ru: 'Russian',
      fr: 'French',
      de: 'German',
      ja: 'Japanese',
      ko: 'Korean',
      it: 'Italian',
    };

    if (questionIndex >= 0 && questionIndex < defaultQuestions.length) {
      const englishQuestion = defaultQuestions[questionIndex];

      if (usersLanguage !== 'en') {
        try {
          const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
            messages: [
              {
                role: 'system',
                content: `Convert the following question prompt into ${languageMap[usersLanguage]}`,
              },
              { role: 'user', content: englishQuestion },
            ],
            model: 'gpt-3.5-turbo',
          });

          const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
          questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
        } catch (error) {
          functions.logger.error(`Error translating with OpenAI request: ${JSON.stringify(error)}`);

          const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
          questionText = defaultQuestions[backupIndex];
        }
      } else {
        questionText = englishQuestion;
      }
    } else {
      try {
        const relationshipDuration = partnershipData.startDate;
        const userName = userData.name;
        const partnerName = partnerData.name;
        const relationshipType = relationshipTypeMap[partnershipData?.type as RelationshipType];

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

        const timeFrames = ['past', 'present', 'future'];

        const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomTimeFrame = timeFrames[Math.floor(Math.random() * timeFrames.length)];
        const promptLanguage =
          usersLanguage === 'en' ? '' : ` in ${languageMap[usersLanguage] || 'English'}`;

        const prompt = `Craft a ${randomAdjective} question${promptLanguage} (90 characters max) about their ${randomTimeFrame} for ${userName} and ${partnerName} who are ${relationshipType} and have been together for ${relationshipDuration}.`;
        const systemPrompt = `As a couples expert, suggest a question that encourages ${userName} and ${partnerName} to explore new dimensions of their relationship, foster understanding, or share a meaningful moment.`;

        functions.logger.info(`Prompt: ${prompt}`);

        const chatCompletion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          model: 'gpt-4',
        });

        const openAIQuestion: string | null = chatCompletion.choices[0].message.content;
        questionText = openAIQuestion?.replace(/^["']|["']$/g, '');
      } catch (error: unknown) {
        functions.logger.error(`Error with OpenAI request: ${JSON.stringify(error)}`);

        const backupIndex = Math.floor(Math.random() * defaultQuestions.length);
        questionText = defaultQuestions[backupIndex];
      }
    }

    const questionId = uuidv4();
    const question = {
      id: questionId,
      partnershipId: partnershipData.id,
      text: questionText,
      createdAt: admin.firestore.Timestamp.now(),
    };

    try {
      const batch = db.batch();
      batch.set(
        db.collection('partnership').doc(partnershipData.id),
        {
          latestQuestionId: questionId,
        },
        { merge: true },
      );

      batch.set(db.collection('questions').doc(questionId), question, {
        merge: true,
      });

      await batch.commit();
    } catch (error) {
      const e = error as {
        response?: { status?: string; data?: object };
        message?: string;
      };

      if (e.response) {
        functions.logger.error(`Error status ${e.response.status}`);
        functions.logger.error(`Error data ${JSON.stringify(e.response.data)}`);

        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${e.response.data}`,
          e.response.data,
        );
      } else {
        functions.logger.error(`Error message ${error}`);
        throw new functions.https.HttpsError(
          'unknown',
          `Error saving generated question: ${error}`,
          error,
        );
      }
    }

    return question;
  });