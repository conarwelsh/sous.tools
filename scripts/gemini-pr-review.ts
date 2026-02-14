import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "child_process";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  const prNumber = process.env.PR_NUMBER;
  const repoFull = `${process.env.REPO_OWNER}/${process.env.REPO_NAME}`;

  if (!apiKey || !githubToken || !prNumber) {
    console.error("Missing environment variables.");
    process.exit(1);
  }

  // Get the diff
  const diff = execSync(`git diff origin/development...HEAD`).toString();

  if (!diff) {
    console.log("No changes to review.");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are an expert code reviewer named Gemini. 
    Review the following Pull Request diff for the 'sous.tools' platform.
    
    Guidelines:
    - Look for bugs, performance issues, and security risks.
    - Ensure adherence to project conventions (NestJS, Next.js, Tailwind).
    - Provide constructive feedback.
    - If the code is good, give a "Chef's Kiss" approval.

    Diff:
    ${diff.substring(0, 20000)} # Truncate if too large

    Output your review in Markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const review = response.text();

    await fetch(
      `https://api.github.com/repos/${repoFull}/issues/${prNumber}/comments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Gemini-Agent",
        },
        body: JSON.stringify({
          body: `🧐 **Gemini Code Review:**

${review}`,
        }),
      },
    );

    console.log("Review posted.");
  } catch (error) {
    console.error("Error during review:", error);
    process.exit(1);
  }
}

main();
