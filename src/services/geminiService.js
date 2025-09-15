import { GoogleGenerativeAI } from "@google/generative-ai";
// chose to use gemini flash given it is the cheapest option for this project :)

// Mock quiz data for testing when API key is not available or API calls fail
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
// Function to generate a quiz based on provided facts using Google Gemini API
export async function generateQuiz(factsText) {
  try {
    // Get API key from the environment variable
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    
    // If no API key is available, use mock data
    // The mock data helped me a lot during development to avoid using up tokens
    if (!apiKey) {
      console.warn("No API key available, using mock quiz data");
      return mockQuizData;
    }
    
    // Initialize the Google Generative AI client with the API key
    // the api key is stored in an environment variable for security
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the Gemini model
    // I chose gemini-2.0-flash because it is the most cost effective for this project
    // No need to use a more advanced model like Gemini Pro for simple quiz generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Prepare the prompt for quiz generation
    const prompt = `
      You are a master Quizer... Create a multiple choice quiz based on the following Laws:
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
          "correctAnswerIndex": 0 // Index of the correct answer (0-3)
        }
      ]
      
      Only return the JSON array, no explanations or other text.
    `;

    // Generate content using the model
    // This call send the promp to gemini and waits for the responce to then process it
    const result = await model.generateContent(prompt);
    // Extract the text response from the result
    const response = await result.response;
    const text = response.text();
    
    // Try to extract JSON from the response
    // This text parsing is necessary because the model might return additional text around the JSON even when told not to
    let jsonMatch = text.match(/(\[\s*\{.*\}\s*\])/s);
    let jsonText = jsonMatch ? jsonMatch[0] : text;
    
    // Clean up the text to handle potential formatting issues
    // the trim method is great for removing any extra spaces or lines 
    jsonText = jsonText.replace(/```json|```/g, '').trim();
    
    // Try to parse the JSON
    // this means if the file is not formatted correctly it will return the mock quiz data instead of crashing the app 
    // I used a try catch here to handle any of the errors given that using a LLM can be unpredictable at times
    try {
      const quizData = JSON.parse(jsonText);
      
      // Validate the structure
      // This makes sure that the quiz data in the array is valid and has a length greater than 0
      // if not it will throw the error and use the mock data
      if (Array.isArray(quizData) && quizData.length > 0) {
        return quizData;
      } else {
        throw new Error("Invalid quiz data structure");
      }
      // The reason for this nested try catch is to handle errors specific to JSON parsing 
      // That means if the JSON is invalid it will use the mock data instead of crashing the app
      // I have read that parsing errors are common when dealing with LLMs 
    } catch (parseError) {
      console.error("Failed to parse JSON from API response", parseError);
      return mockQuizData;
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    // In case of any error, return the mock data
    return mockQuizData;
  }
}