import { aiClient } from "../client/aiClient";

// Interface for the arguments of the analyze function
interface AnalyzeArgs {
  resumeText: string;
  jobDescription: string;
}

// Defining the ScreeningResult type
type ScreeningResult = {
  matchScore: number;
  yearsOfExperience?: number;
  matchedSkills: string[];
  missingKeywords?: string[];
  hiringRecommendation: "Shortlist" | "Review" | "Reject";
  reasoning: string;
};

export async function screenResume({ resumeText, jobDescription }: AnalyzeArgs) {
  try {
    // Prompt to be sent to the AI model
    const prompt = `
            ## JOB DESCRIPTION
            ${jobDescription}

            ## APPLICANT RESUME TEXT
            ${resumeText}

            ## OUTPUT INSTRUCTIONS
            Rate this resume on a scale of 1-10 and provide a detailed feedback on why.
        `;

    // Generating content using the AI model
    const interaction = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      // Prompt to be sent to the AI model
      contents: prompt,
      // Configuration for the AI model
      config: {
        // System instructions explicitly keep the model in "recruiter mode"
        systemInstruction:
          "You are an expert HR Data Analyst and a recruitment automation parser. Evaluate candidates objectively based strictly on the provided job description.",
        // Response format
        responseMimeType: "application/json",
        // Response schema
        responseSchema: {
          type: "object",
          properties: {
            matchScore: { type: "integer" },
            yearsOfExperience: { type: "integer" },
            matchedSkills: {
              type: "array",
              items: { type: "string" },
            },
            missingKeywords: {
              type: "array",
              items: { type: "string" },
            },
            hiringRecommendation: {
              type: "string",
              enum: ["Shortlist", "Review", "Reject"],
            },
            reasoning: {
              type: "string",
              description:
                "A short summary (2-3 sentences) explaining the hiring score and key strengths/weaknesses.",
            },
          },
          required: [
            "matchScore",
            "matchedSkills",
            "hiringRecommendation",
            "reasoning",
          ],
        },
      },
    });

    // Printing the interaction
    console.log(interaction);

    // Parsing the interaction
    const screeningResult = JSON.parse(
      interaction.text ?? "{}",
    ) as ScreeningResult;

    return screeningResult;
  } catch (error) {
    // Catching the error
    console.error("Error generating content:", error);
    return {};
  }
}
