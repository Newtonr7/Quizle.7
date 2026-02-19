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
    const apiKey = process.env.REACT_APP_GROQ_API_KEY;

    if (!apiKey) {
      return mockQuizData;
    }

    const prompt = `
      You are a quiz master. Create a multiple choice quiz based on the following facts:
      ${factsText}

   Create 1 challenging question based on each submitted facts.

For each question:
1. Generate 4 answer choices (A, B, C, D) with ONE correct answer and THREE plausible distractors.
2. Ensure all answer choices are approximately the same length to avoid giving unintentional clues.
3. Make distractors plausible by using related concepts or definitions.
4. The correct answer must accurately match the submitted fact.
5. Design questions that test deeper understanding rather than simple recall.
6. Format questions clearly with the question text followed by the 4 answer choices.
7. Vary the position of the correct answer (don't always make it option A, B, C, or D).
8. each question should be based on the facts definition and the answers should be the names of the facts.
9. The questions need to be challenging and require critical thinking.
10. The answers can be other fact names that are not the same as the question but are listed in the input, this will make the quiz more challenging.
11. DO NOT MAKE THE ANSWERS TO THE QUESTIONS THE LONGEST LENGTH, THIS WILL GIVE AWAY THE ANSWER.
12. The questions for the quiz should match the amount of facts provided in the input.
This quiz is intended to challenge knowledgeable students with subtly difficult distinctions between answer choices.
      Format your response as a JSON array of question objects with this structure:
      [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswerIndex": 0
        }
      ]

      Only return the JSON array, no explanations or other text.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content;

    let jsonMatch = text.match(/(\[\s*\{.*\}\s*\])/s);
    let jsonText = jsonMatch ? jsonMatch[0] : text;
    jsonText = jsonText.replace(/```json|```/g, '').trim();
    jsonText = jsonText.replace(/\/\/.*$/gm, '');

    // Inner try-catch handles JSON parsing errors from unpredictable LLM output
    try {
      const quizData = JSON.parse(jsonText);

      if (Array.isArray(quizData) && quizData.length > 0) {
        return quizData;
      } else {
        throw new Error("Invalid quiz data structure");
      }
    } catch (parseError) {
      return mockQuizData;
    }
  } catch (error) {
    console.error('Groq API error:', error);
    return mockQuizData;
  }
}
