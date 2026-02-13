import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;
  const issueNumber = process.env.ISSUE_NUMBER;
  const title = process.env.ISSUE_TITLE;
  const body = process.env.ISSUE_BODY;
  const repo = process.env.GITHUB_REPOSITORY; // "owner/repo"

  if (!apiKey || !githubToken || !issueNumber) {
    console.error("Missing required environment variables.");
    process.exit(1);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are an expert software engineering agent triaging a new GitHub issue for the 'sous.tools' platform.
    
    Project Context:
    - Namespace: @sous
    - Apps: @sous/web (Next.js 16), @sous/api (NestJS), @sous/cli (NestJS CLI), @sous/wearos, @sous/docs
    - Packages: @sous/client-sdk, @sous/config, @sous/logger, @sous/ui (Component library), @sous/emails
    - Stack: Drizzle ORM, PostgreSQL, BullMQ, Tailwind CSS, Radix UI.

    Issue Title: ${title}
    Issue Body:
    ${body}

    Your goal is to:
    1. Analyze the issue.
    2. Suggest labels (comma-separated list). Available labels: bug, enhancement, documentation, question, help wanted, invalid, wontfix, high-priority, low-priority.
    3. Provide a helpful initial comment summarizing the issue, suggesting potential areas of the codebase to investigate (e.g. apps/api/src/domains/...), or asking clarifying questions.

    Output STRICT JSON format:
    {
      "labels": ["label1", "label2"],
      "comment": "Markdown formatted comment..."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean up JSON markdown block if present
    const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(jsonStr);

    console.log("Analysis complete:", data);

    // Apply Labels
    if (data.labels && data.labels.length > 0) {
      await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/labels`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Gemini-Agent"
        },
        body: JSON.stringify({ labels: data.labels })
      });
    }

    // Post Comment
    if (data.comment) {
      await fetch(`https://api.github.com/repos/${repo}/issues/${issueNumber}/comments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "Gemini-Agent"
        },
        body: JSON.stringify({ body: `🤖 **Gemini Triage:**

${data.comment}` })
      });
    }

  } catch (error) {
    console.error("Error processing issue:", error);
    process.exit(1);
  }
}

main();
