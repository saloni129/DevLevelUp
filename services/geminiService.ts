
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, RoadmapItem, AssessmentQuestion, SkillGap, InterviewFeedback, TechNewsResponse } from "../types";

const parseAIResponse = (text: string | undefined) => {
  if (!text || text.trim() === "") {
    throw new Error("AI returned an empty response.");
  }
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  const jsonString = jsonMatch ? jsonMatch[0] : text;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Failed to parse AI JSON response:", text);
    throw new Error("Malformed JSON response from AI.");
  }
};

export const analyzeSkillGaps = async (profile: UserProfile): Promise<{ gaps: SkillGap[], resumeAnalysis: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this developer profile and resume. Identify technical skill gaps based on their target role: ${profile.role} at ${profile.level} level.
    Declared Skills: ${profile.skills.join(', ')}
    Confidence: ${JSON.stringify(profile.confidenceLevels)}
    Resume Text: ${profile.resumeContent || 'No resume uploaded.'}
    Output valid JSON only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gaps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                gapLevel: { type: Type.STRING },
                reason: { type: Type.STRING }
              },
              required: ["skill", "gapLevel", "reason"]
            }
          },
          resumeAnalysis: { type: Type.STRING }
        },
        required: ["gaps", "resumeAnalysis"]
      }
    }
  });

  return parseAIResponse(response.text);
};

export const generateAssessment = async (profile: UserProfile): Promise<AssessmentQuestion[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Generate 5 high-quality technical interview questions for a ${profile.level} ${profile.role} developer.
    Focus on: ${profile.skills.join(', ')}.
    Include a mix of conceptual and scenario-based questions.
    Return a JSON array with: id, text, type ("MultipleChoice" or "Scenario"), options (if multiple choice), correctAnswer (the full string of the correct choice), explanation (why it's correct), difficulty (1-10).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            text: { type: Type.STRING },
            type: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.NUMBER }
          },
          required: ["id", "text", "type", "difficulty"]
        }
      }
    }
  });

  return parseAIResponse(response.text);
};

export const generateRoadmap = async (profile: UserProfile, gaps: SkillGap[]): Promise<RoadmapItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Create a personalized learning roadmap for a ${profile.level} ${profile.role}.
    Gaps: ${JSON.stringify(gaps)}
    Provide exactly 3 high-quality learning resources for each topic.
    Return a JSON array of roadmap items with: id, topic, priority, type, resources, status.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            topic: { type: Type.STRING },
            priority: { type: Type.STRING },
            type: { type: Type.STRING },
            resources: { type: Type.ARRAY, items: { type: Type.STRING } },
            status: { type: Type.STRING }
          },
          required: ["id", "topic", "priority", "type", "resources", "status"]
        }
      }
    }
  });

  return parseAIResponse(response.text);
};

export const evaluateMockResponse = async (question: string, answer: string, profile: UserProfile): Promise<InterviewFeedback> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Act as a senior technical interviewer for a ${profile.level} ${profile.role} position.
    Question: "${question}"
    Candidate Answer: "${answer}"
    Evaluate the response. Provide a score (1-100), a concise critique, and a "perfect" version of the answer.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          critique: { type: Type.STRING },
          improvedAnswer: { type: Type.STRING }
        },
        required: ["score", "critique", "improvedAnswer"]
      }
    }
  });

  return parseAIResponse(response.text);
};

export const getNextInterviewQuestion = async (profile: UserProfile, focusSkills: string[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Generate ONE challenging interview question for a ${profile.level} ${profile.role} focusing on ${focusSkills.join(', ')}. Return only the question text as a plain string.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  
  return response.text || "Can you explain a complex technical problem you solved recently and the steps you took?";
};

export const fetchTechNews = async (role: string): Promise<TechNewsResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `List 8 of the most critical tech news stories, framework updates, or industry trends specifically for a ${role} developer in late 2024 and 2025. 
    Explain why each matters to their career. Use Google Search to find current data.`,
    config: {
      tools: [{ googleSearch: {} }]
    }
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.filter(chunk => chunk.web)
    ?.map(chunk => ({
      title: chunk.web?.title || 'Tech News Source',
      uri: chunk.web?.uri || '#'
    })) || [];

  return {
    text: response.text || "No recent updates found. Try refreshing later.",
    sources: sources
  };
};

export const getQuickStudyContent = async (resourceName: string, topic: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a comprehensive "Quick Study" guide for the following resource/topic: "${resourceName}" in the context of "${topic}". 
  Format it in Markdown with bullet points, code examples if applicable, and key takeaways for an interview.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });
  
  return response.text || "Failed to generate study content. Please try again.";
};
