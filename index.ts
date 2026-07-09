import { screenResume } from "./services/resumeScreener";

// Sample job description
const sampleJobDescription = `
Senior Frontend Engineer - React

About the role:
We're looking for a Senior Frontend Engineer to join our Platform team. You will build scalable web applications using React, TypeScript, and modern CSS.

Requirements:
- 5+ years of professional experience with React and TypeScript
- Strong experience with state management: Redux, Zustand, or React Query
- Experience with Next.js and SSR/SSG
- Proficiency in testing: Jest, React Testing Library, Cypress
- Experience with CI/CD pipelines and Git
- Familiarity with REST APIs and GraphQL
- Bonus: Experience with Node.js, AWS, or design systems

Responsibilities:
- Architect and implement new user-facing features
- Mentor junior engineers and conduct code reviews
- Collaborate with Product and Design to ship high-quality UX
- Improve frontend performance and accessibility
`;

const sampleResumeText = `
ROHIT SHARMA
Senior Software Engineer | Kolkata, India

SUMMARY
Frontend engineer with 6 years of experience building responsive web apps in React and TypeScript. Passionate about performance, accessibility, and clean code.

EXPERIENCE
Senior Software Engineer, TechCorp India | 2021 - Present
- Led migration of legacy Angular app to React + TypeScript + Next.js, improving LCP by 40%
- Implemented global state using Redux Toolkit and React Query for server cache
- Built component library in Storybook used across 4 product teams
- Wrote unit and integration tests with Jest and React Testing Library, 90% coverage
- Set up GitHub Actions CI/CD pipeline, reduced deploy time from 25m to 6m

Software Engineer, DevStudio | 2019 - 2021
- Developed customer dashboard in React, TypeScript, and REST APIs
- Collaborated with designers in Figma to implement WCAG AA compliant UI
- Introduced Cypress for E2E testing

SKILLS
Languages: JavaScript, TypeScript, HTML, CSS, SQL
Frameworks: React, Next.js, Node.js, Express
Tools: Redux, React Query, Webpack, Vite, Jest, Cypress, Git, Docker, AWS S3/CloudFront
`;

async function main() {
  const result = await screenResume({
    resumeText: sampleResumeText,
    jobDescription: sampleJobDescription,
  });

  console.log(result);
}
main();
