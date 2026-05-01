/**
 * Classification prompt template for AI sector tagging.
 * Used by both Gemini and OpenRouter backends.
 */
export function buildClassificationPrompt(params: {
  fullName: string;
  description: string | null;
  topics: string[];
  language: string | null;
  readmeExcerpt: string | null;
}): string {
  const readmeText = params.readmeExcerpt
    ? params.readmeExcerpt.slice(0, 3000)
    : "(No README available)";

  return `You are an expert at classifying open source software projects by their real-world social impact sector.

Given the following repository information, classify it into exactly ONE primary sector and identify relevant UN Sustainable Development Goals (SDGs).

Repository: ${params.fullName}
Description: ${params.description ?? "(No description)"}
Topics: ${params.topics.length > 0 ? params.topics.join(", ") : "(No topics)"}
Primary Language: ${params.language ?? "(Unknown)"}
README (first 3000 chars):
${readmeText}

You MUST respond with valid JSON only, no markdown fencing, no explanation. Use this exact schema:
{
  "sector": "Health" | "Education" | "Climate" | "Humanitarian" | "Civic Tech" | "Accessibility" | "General Tech",
  "confidence": <number between 0.0 and 1.0>,
  "sdg_goals": [<array of SDG goal numbers 1-17>],
  "keywords": [<array of up to 5 keywords that justify the classification>]
}

Classification rules:
- If the project clearly relates to healthcare, medical, clinical, or patient care → "Health"
- If the project is about education, learning, schools, or students → "Education"
- If the project addresses climate, environment, carbon, or sustainability → "Climate"
- If the project supports humanitarian aid, refugees, disaster relief, or NGOs → "Humanitarian"
- If the project involves government, democracy, voting, or civic engagement → "Civic Tech"
- If the project focuses on accessibility, assistive tech, screen readers, or WCAG → "Accessibility"
- If none of the above clearly apply → "General Tech"
- Set confidence below 0.7 if the classification is uncertain.`;
}
