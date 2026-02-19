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

    const prompt = `You are a quiz generator for students reviewing their notes.

Create a multiple choice quiz from the following study material:
${factsText}

Rules:
1. Generate exactly 1 question per distinct fact or concept in the input.
2. Mix question styles — some should test recall (e.g., "What is...?") and others should test application (e.g., "Which of the following describes...?" or "A student observes X. This is an example of...?").
3. Each question has 4 answer choices with exactly 1 correct answer.
4. Make distractors plausible — use related terms, similar concepts, or common misconceptions from the same subject area.
5. Keep all answer choices similar in length and detail.
6. Randomize the position of the correct answer across questions.
7. Difficulty should be appropriate for a study review session — challenging enough to confirm understanding, not trick questions.

Return ONLY a JSON array with this exact structure, no other text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswerIndex": 0
  }
]`;

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
