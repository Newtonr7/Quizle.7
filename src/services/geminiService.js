import { supabase } from './supabase';

// Mock quiz data for development and API fallback
const mockQuizData = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "London", "Paris", "Madrid"],
    correctAnswerIndex: 2
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswerIndex: 1
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["H2O", "CO2", "NaCl", "O2"],
    correctAnswerIndex: 0
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
    correctAnswerIndex: 1
  },
  {
    question: "What is the largest mammal?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswerIndex: 1
  }
];

export async function generateQuiz(factsText) {
  try {
    if (!supabase) {
      return mockQuizData;
    }

    const { data, error } = await supabase.functions.invoke('generate-quiz', {
      body: { factsText },
    });

    if (error) {
      throw error;
    }

    if (Array.isArray(data) && data.length > 0) {
      return data;
    } else {
      throw new Error("Invalid quiz data structure");
    }
  } catch (error) {
    console.error('Quiz generation error:', error);
    return mockQuizData;
  }
}
