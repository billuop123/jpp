import { config } from "dotenv";
import path from "path";
import { PrismaClient } from "../generated/prisma/client";
import { pipeline } from '@xenova/transformers';

config({ path: path.resolve(__dirname, "../.env") });

const prisma = new PrismaClient();

// Embedding service
let embedder: any;
let initialized = false;

async function initEmbedder() {
  if (!initialized) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    initialized = true;
  }
}

async function embed(text: string): Promise<number[]> {
  await initEmbedder();
  const output = await embedder(text);
  const embeddingArray = Array.from(output.data) as number[];

  if (embeddingArray.length > 384) {
    const numTokens = embeddingArray.length / 384;
    const pooled = new Array(384).fill(0);
    for (let dim = 0; dim < 384; dim++) {
      let sum = 0;
      for (let token = 0; token < numTokens; token++) {
        sum += embeddingArray[token * 384 + dim] as number;
      }
      pooled[dim] = sum / numTokens;
    }
    return pooled;
  }

  return embeddingArray;
}

const roles = [
  { name: "Admin", code: "ADMIN" },
  { name: "Recruiter", code: "RECRUITER" },
  { name: "Candidate", code: "CANDIDATE" },
];

const jobTypes = [
  { name: "full-time", description: "Full-time employment" },
  { name: "part-time", description: "Part-time employment" },
  { name: "contract", description: "Contract-based role" },
  { name: "internship", description: "Internship or trainee position" },
  { name: "freelance", description: "Freelance or consulting engagement" },
];

const companyTypes = [
  { name: "Startup", description: "Early-stage or growth-stage company" },
  { name: "SME", description: "Small or medium-sized enterprise" },
  { name: "Enterprise", description: "Large established organization" },
  { name: "Agency", description: "Recruitment, consulting, or creative agency" },
  { name: "Non-profit", description: "Non-governmental or non-profit organization" },
];

const emailTemplates = [
  {
    name: "Application Received",
    code: "APPLICATION_RECEIVED",
    subject: "We have received your application",
    body: "Hi {{candidateName}},\n\nWe have received your application for {{jobTitle}} at {{companyName}}. Our team will review your profile and get back to you shortly.\n\nBest regards,\n{{companyName}}",
    description: "Sent to a candidate when they apply for a job.",
  },
  {
    name: "Application Shortlisted",
    code: "APPLICATION_SHORTLISTED",
    subject: "Your application has been shortlisted",
    body: "Hi {{candidateName}},\n\nGood news! Your application for {{jobTitle}} at {{companyName}} has been shortlisted. We will contact you soon with next steps.\n\nBest regards,\n{{companyName}}",
    description: "Sent when an application is shortlisted.",
  },
  {
    name: "Application Rejected",
    code: "APPLICATION_REJECTED",
    subject: "Update on your application",
    body: "Hi {{candidateName}},\n\nThank you for your interest in {{jobTitle}} at {{companyName}}. After careful consideration, we will not be moving forward with your application at this time.\n\nWe appreciate the time you took to apply and encourage you to apply for future roles.\n\nBest regards,\n{{companyName}}",
    description: "Sent when an application is rejected.",
  },
];

const companySettingsDefaults = [
  {
    key: "ALLOW_APPLICATION_EMAILS",
    value: true,
    isSystemSetting: true,
  },
  {
    key: "ALLOW_STATUS_UPDATE_EMAILS",
    value: true,
    isSystemSetting: true,
  },
];

const sampleJobs = [
  {
    title: "Software Engineer",
    description: "Join our team as a Software Engineer working with modern web technologies. You'll be responsible for developing scalable applications using TypeScript and Node.js. Work on challenging problems, collaborate with cross-functional teams, and contribute to building products that impact millions of users. We're looking for someone passionate about clean code, best practices, and continuous learning.",
    location: "Remote",
    isRemote: true,
    skills: ["TypeScript", "Node.js", "React", "Git", "REST API", "Testing", "Agile"],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    requirements: "Bachelor's degree in Computer Science or related field. 2+ years of experience with TypeScript and Node.js. Strong understanding of web technologies and RESTful APIs. Experience with version control systems like Git.",
    responsibilities: "Design and develop scalable web applications. Write clean, maintainable code. Participate in code reviews. Collaborate with product and design teams. Debug and fix issues in production.",
    benefits: "Competitive salary, health insurance, flexible work hours, remote work options, professional development budget, stock options.",
    salaryMin: 80000,
    salaryMax: 120000,
    experienceLevel: 2,
  },
  {
    title: "Product Manager",
    description: "Drive product strategy, roadmap, and delivery in a fast-paced environment. Lead cross-functional teams to define product vision, gather requirements, and prioritize features. Work closely with engineering, design, and business stakeholders to deliver products that solve real customer problems. Strong analytical skills and experience with Agile methodologies required.",
    location: "Hybrid - San Francisco, CA",
    isRemote: false,
    skills: ["Product Management", "Agile", "Communication", "Data Analysis", "User Research", "Roadmapping", "Stakeholder Management"],
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    requirements: "5+ years of product management experience. Strong analytical and problem-solving skills. Experience with Agile methodologies. Excellent communication and leadership abilities. MBA or equivalent experience preferred.",
    responsibilities: "Define product vision and strategy. Create and maintain product roadmap. Gather and prioritize requirements. Work with engineering and design teams. Analyze metrics and user feedback. Present to stakeholders and executives.",
    benefits: "Competitive salary, equity, health insurance, 401k matching, unlimited PTO, gym membership, commuter benefits.",
    salaryMin: 130000,
    salaryMax: 180000,
    experienceLevel: 5,
  },
  {
    title: "Backend Engineer",
    description: "Build scalable backend services and APIs using modern technologies. Design and implement RESTful APIs with Nest.js and TypeScript. Work with PostgreSQL databases and Prisma ORM for data modeling. Implement message queues using Kafka for asynchronous processing and Redis for caching. Deploy and manage services on AWS using Docker and Kubernetes. Collaborate with frontend teams to deliver seamless user experiences. Experience with microservices architecture and event-driven systems is highly valued.",
    location: "Remote",
    isRemote: true,
    skills: ["Nest.js", "PostgreSQL", "TypeScript", "REST API", "Kafka", "Redis", "Docker", "AWS", "Kubernetes", "Microservices", "Prisma", "Node.js"],
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
    requirements: "3+ years of backend development experience. Strong proficiency in Nest.js and TypeScript. Experience with PostgreSQL and Prisma ORM. Knowledge of message queues (Kafka) and caching (Redis). Familiarity with Docker and Kubernetes. Understanding of microservices architecture.",
    responsibilities: "Design and develop RESTful APIs. Implement database schemas and queries. Set up message queues and caching layers. Deploy services using Docker and Kubernetes. Monitor and optimize application performance. Write unit and integration tests. Participate in architecture decisions.",
    benefits: "Competitive salary, remote work, health insurance, learning budget, conference attendance, flexible hours, stock options.",
    salaryMin: 90000,
    salaryMax: 140000,
    experienceLevel: 3,
  },
  {
    title: "Full Stack Engineer",
    description: "Develop end-to-end web applications using Next.js and Nest.js. Build responsive, modern UIs with React, TypeScript, and Tailwind CSS. Implement secure authentication systems and role-based access control. Design and develop RESTful APIs and integrate with PostgreSQL databases using Prisma ORM. Implement real-time features using WebSockets for live updates. Work with message queues like Kafka for handling concurrent operations and Redis for caching. Deploy applications using Docker and manage infrastructure on AWS. Participate in code reviews, write tests, and maintain high code quality. We're looking for someone with strong problem-solving skills who can work across the full stack and deliver features from database to UI.",
    location: "Pokhara, Nepal",
    isRemote: false,
    skills: ["Next.js", "React", "Nest.js", "TypeScript", "PostgreSQL", "Prisma", "Tailwind CSS", "WebSockets", "Kafka", "Redis", "Docker", "AWS", "REST API", "Authentication", "Testing"],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    requirements: "2+ years of full-stack development experience. Proficiency in Next.js, React, and Nest.js. Strong TypeScript skills. Experience with PostgreSQL and Prisma ORM. Knowledge of WebSockets and real-time features. Familiarity with Kafka and Redis. Understanding of Docker and AWS. Experience with authentication and authorization.",
    responsibilities: "Build full-stack features from UI to database. Develop responsive interfaces with React and Tailwind CSS. Implement backend APIs with Nest.js. Design database schemas with Prisma. Add real-time features using WebSockets. Integrate message queues and caching. Deploy and monitor applications. Write comprehensive tests. Collaborate with team members.",
    benefits: "Competitive salary for Nepal market, health insurance, annual bonus, learning opportunities, team outings, snacks and beverages, career growth.",
    salaryMin: 60000,
    salaryMax: 100000,
    experienceLevel: 2,
  },
  {
    title: "Frontend Developer",
    description: "Build responsive and performant user interfaces with React and TypeScript. Create reusable components, implement state management, and ensure cross-browser compatibility. Work closely with designers to implement pixel-perfect UIs. Optimize application performance and ensure accessibility standards. Experience with modern CSS frameworks and build tools is a plus.",
    location: "Remote",
    isRemote: true,
    skills: ["React", "TypeScript", "CSS", "HTML", "JavaScript", "Tailwind CSS", "Redux", "Webpack", "Responsive Design", "Accessibility"],
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    requirements: "2+ years of frontend development experience. Strong proficiency in React and TypeScript. Solid understanding of HTML, CSS, and JavaScript. Experience with state management libraries. Knowledge of responsive design and accessibility. Familiarity with build tools and bundlers.",
    responsibilities: "Develop user interfaces with React. Implement responsive designs. Create reusable components. Optimize application performance. Ensure cross-browser compatibility. Collaborate with designers and backend developers. Write unit tests for components.",
    benefits: "Remote work, flexible hours, health insurance, learning budget, home office setup allowance, competitive salary.",
    salaryMin: 70000,
    salaryMax: 110000,
    experienceLevel: 2,
  },
  {
    title: "DevOps Engineer",
    description: "Manage infrastructure, CI/CD pipelines, and cloud deployments. Design and implement automated deployment pipelines using GitHub Actions or Jenkins. Manage Kubernetes clusters and containerized applications with Docker. Provision infrastructure as code using Terraform. Monitor system health, implement logging and alerting solutions. Optimize cloud costs and ensure high availability of services on AWS.",
    location: "Remote",
    isRemote: true,
    skills: ["AWS", "Kubernetes", "Docker", "Terraform", "CI/CD", "Jenkins", "GitHub Actions", "Monitoring", "Linux", "Bash", "Python"],
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
    requirements: "3+ years of DevOps experience. Strong knowledge of AWS services. Experience with Kubernetes and Docker. Proficiency in Terraform or similar IaC tools. Understanding of CI/CD pipelines. Linux system administration skills. Scripting experience with Bash or Python.",
    responsibilities: "Manage cloud infrastructure on AWS. Deploy and maintain Kubernetes clusters. Create and maintain CI/CD pipelines. Implement monitoring and alerting. Automate infrastructure provisioning. Optimize cloud costs. Ensure system security and compliance. Troubleshoot production issues.",
    benefits: "Remote work, competitive salary, health insurance, learning budget, conference attendance, flexible hours, stock options.",
    salaryMin: 95000,
    salaryMax: 145000,
    experienceLevel: 3,
  },
  {
    title: "Data Scientist",
    description: "Analyze data and build machine learning models to drive business insights. Work with large datasets to identify patterns and trends. Develop predictive models using Python and popular ML frameworks. Create data visualizations and dashboards to communicate findings. Collaborate with engineering teams to deploy models to production. Strong statistical knowledge and experience with SQL required.",
    location: "Boston, MA",
    isRemote: false,
    skills: ["Python", "Machine Learning", "SQL", "Statistics", "Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Data Visualization", "Jupyter"],
    deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
    requirements: "Master's or PhD in Computer Science, Statistics, or related field. 3+ years of data science experience. Strong Python programming skills. Experience with ML frameworks. Proficiency in SQL. Solid understanding of statistics and probability. Experience deploying models to production.",
    responsibilities: "Analyze large datasets. Build and train machine learning models. Create data visualizations. Develop predictive analytics. Collaborate with engineering teams. Present findings to stakeholders. Deploy models to production. Monitor model performance.",
    benefits: "Competitive salary, equity, health insurance, 401k matching, relocation assistance, learning budget, gym membership.",
    salaryMin: 110000,
    salaryMax: 160000,
    experienceLevel: 3,
  },
  {
    title: "UX Designer",
    description: "Create intuitive and beautiful user experiences for web and mobile applications. Conduct user research, create wireframes and prototypes using Figma. Design user flows and information architecture. Collaborate with product managers and engineers to bring designs to life. Conduct usability testing and iterate based on feedback. Strong portfolio demonstrating user-centered design process required.",
    location: "Remote",
    isRemote: true,
    skills: ["Figma", "User Research", "Prototyping", "UI Design", "Wireframing", "User Testing", "Design Systems", "Adobe XD", "Sketch"],
    deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
    requirements: "3+ years of UX design experience. Strong portfolio showcasing design process. Proficiency in Figma and other design tools. Experience with user research and testing. Understanding of design systems. Excellent communication skills. Bachelor's degree in Design or related field.",
    responsibilities: "Conduct user research and interviews. Create wireframes and prototypes. Design user interfaces. Develop design systems. Conduct usability testing. Collaborate with product and engineering teams. Present designs to stakeholders. Iterate based on feedback.",
    benefits: "Remote work, flexible hours, competitive salary, health insurance, design tools budget, conference attendance, learning opportunities.",
    salaryMin: 85000,
    salaryMax: 125000,
    experienceLevel: 3,
  },
  {
    title: "Mobile Developer",
    description: "Build native mobile applications for iOS and Android platforms. Develop cross-platform apps using React Native or native technologies like Swift and Kotlin. Implement responsive mobile UIs, integrate with backend APIs, and optimize app performance. Handle app store submissions and updates. Experience with mobile-specific features like push notifications, location services, and offline storage required.",
    location: "Austin, TX",
    isRemote: false,
    skills: ["React Native", "Swift", "Kotlin", "Mobile UI", "iOS", "Android", "REST API", "Firebase", "Push Notifications", "App Store"],
    deadline: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000),
    requirements: "3+ years of mobile development experience. Proficiency in React Native or native iOS/Android development. Experience with mobile UI design patterns. Knowledge of REST APIs and backend integration. Familiarity with app store submission process. Understanding of mobile performance optimization.",
    responsibilities: "Develop mobile applications for iOS and Android. Implement mobile UI designs. Integrate with backend APIs. Optimize app performance. Handle push notifications and offline storage. Submit apps to app stores. Fix bugs and add new features. Write unit and integration tests.",
    benefits: "Competitive salary, health insurance, 401k matching, relocation assistance, gym membership, free lunch, stock options.",
    salaryMin: 95000,
    salaryMax: 140000,
    experienceLevel: 3,
  },
  {
    title: "QA Engineer",
    description: "Ensure product quality through automated and manual testing. Design and implement test automation frameworks using Selenium and Jest. Write comprehensive test cases covering functional, integration, and end-to-end scenarios. Perform manual testing for edge cases and user flows. Work with developers to identify and fix bugs. Maintain test documentation and participate in release planning.",
    location: "Remote",
    isRemote: true,
    skills: ["Test Automation", "Selenium", "Jest", "QA Processes", "Manual Testing", "Cypress", "API Testing", "Bug Tracking", "Test Planning"],
    deadline: new Date(Date.now() + 33 * 24 * 60 * 60 * 1000),
    requirements: "2+ years of QA experience. Experience with test automation tools. Knowledge of testing methodologies. Proficiency in writing test cases. Understanding of CI/CD pipelines. Familiarity with bug tracking tools. Strong attention to detail.",
    responsibilities: "Design and implement test automation frameworks. Write automated tests. Perform manual testing. Create test plans and test cases. Report and track bugs. Collaborate with developers. Participate in release planning. Maintain test documentation.",
    benefits: "Remote work, flexible hours, competitive salary, health insurance, learning budget, professional development.",
    salaryMin: 70000,
    salaryMax: 105000,
    experienceLevel: 2,
  },
  {
    title: "Security Engineer",
    description: "Protect systems and data through security best practices and monitoring. Conduct security audits and penetration testing to identify vulnerabilities. Implement security controls and compliance measures. Monitor systems for security threats and respond to incidents. Work with development teams to ensure secure coding practices. Experience with security frameworks and compliance standards like SOC2, ISO 27001 required.",
    location: "Seattle, WA",
    isRemote: false,
    skills: ["Security", "Penetration Testing", "Compliance", "Networking", "Vulnerability Assessment", "SIEM", "Incident Response", "Cryptography", "Security Auditing"],
    deadline: new Date(Date.now() + 38 * 24 * 60 * 60 * 1000),
    requirements: "4+ years of security engineering experience. Strong knowledge of security principles. Experience with penetration testing tools. Understanding of compliance frameworks. Knowledge of networking and system administration. Relevant security certifications (CISSP, CEH, etc.) preferred.",
    responsibilities: "Conduct security audits and penetration tests. Implement security controls. Monitor systems for threats. Respond to security incidents. Develop security policies. Train developers on secure coding. Ensure compliance with standards. Perform vulnerability assessments.",
    benefits: "Competitive salary, health insurance, 401k matching, relocation assistance, security certifications budget, conference attendance.",
    salaryMin: 105000,
    salaryMax: 155000,
    experienceLevel: 4,
  },
  {
    title: "Technical Writer",
    description: "Create clear and comprehensive technical documentation for developers. Write API documentation, user guides, and tutorials. Collaborate with engineering teams to understand features and translate technical concepts into easy-to-understand content. Maintain documentation sites and ensure content is up-to-date. Experience with Markdown, documentation tools, and version control systems required.",
    location: "Remote",
    isRemote: true,
    skills: ["Technical Writing", "Documentation", "API Docs", "Markdown", "Git", "Content Management", "Editing", "Communication"],
    deadline: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    requirements: "2+ years of technical writing experience. Strong writing and editing skills. Experience with API documentation. Proficiency in Markdown and documentation tools. Familiarity with version control systems. Ability to understand technical concepts. Bachelor's degree in English, Communications, or related field.",
    responsibilities: "Write API documentation and user guides. Create tutorials and how-to articles. Collaborate with engineering teams. Maintain documentation sites. Edit and review content. Ensure documentation accuracy. Organize and structure content. Update existing documentation.",
    benefits: "Remote work, flexible hours, competitive salary, health insurance, learning budget, writing tools budget.",
    salaryMin: 65000,
    salaryMax: 95000,
    experienceLevel: 2,
  },
  {
    title: "Engineering Manager",
    description: "Lead and mentor a team of engineers while driving technical excellence. Manage team performance, conduct 1-on-1s, and support career growth. Define technical roadmaps and architecture decisions. Balance technical debt with feature development. Foster a culture of collaboration, innovation, and continuous improvement. Strong technical background and proven leadership experience required.",
    location: "San Francisco, CA",
    isRemote: false,
    skills: ["Leadership", "Team Management", "Technical Strategy", "Agile", "Mentoring", "Architecture", "Communication", "Project Management"],
    deadline: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000),
    requirements: "7+ years of software engineering experience with 2+ years in leadership roles. Strong technical background. Proven track record of managing engineering teams. Experience with Agile methodologies. Excellent communication and interpersonal skills. Ability to make technical and strategic decisions.",
    responsibilities: "Lead and mentor engineering team. Conduct performance reviews and 1-on-1s. Define technical roadmap and architecture. Manage project timelines and deliverables. Collaborate with product and design teams. Foster team culture and growth. Make hiring decisions. Balance technical debt with features.",
    benefits: "Competitive salary, significant equity, health insurance, 401k matching, unlimited PTO, relocation assistance, leadership training.",
    salaryMin: 160000,
    salaryMax: 220000,
    experienceLevel: 7,
  },
  {
    title: "Site Reliability Engineer",
    description: "Ensure system reliability, performance, and scalability. Design and implement monitoring and alerting systems. Manage incident response and post-mortem processes. Optimize system performance and reduce latency. Implement chaos engineering practices to test system resilience. Work with development teams to improve application reliability. Strong Linux and Python skills required.",
    location: "Remote",
    isRemote: true,
    skills: ["SRE", "Monitoring", "Linux", "Python", "Kubernetes", "Prometheus", "Grafana", "Incident Management", "Performance Optimization", "Automation"],
    deadline: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000),
    requirements: "4+ years of SRE or DevOps experience. Strong Linux system administration skills. Proficiency in Python or similar scripting language. Experience with Kubernetes and containerization. Knowledge of monitoring tools (Prometheus, Grafana). Understanding of incident management. Experience with performance optimization.",
    responsibilities: "Design and implement monitoring systems. Manage incident response. Conduct post-mortems. Optimize system performance. Implement automation. Ensure high availability. Work with development teams. Implement chaos engineering. Manage on-call rotations.",
    benefits: "Remote work, competitive salary, health insurance, on-call compensation, learning budget, conference attendance, flexible hours.",
    salaryMin: 110000,
    salaryMax: 160000,
    experienceLevel: 4,
  },
  {
    title: "AI/ML Engineer",
    description: "Develop and deploy machine learning models and AI solutions. Build and train deep learning models using TensorFlow and PyTorch. Work on NLP tasks like text classification, sentiment analysis, and language generation. Deploy models to production and monitor their performance. Optimize model inference for low latency. Stay updated with latest research and implement state-of-the-art techniques. Strong Python skills and ML fundamentals required.",
    location: "Palo Alto, CA",
    isRemote: false,
    skills: ["Python", "TensorFlow", "PyTorch", "Deep Learning", "NLP", "Machine Learning", "Neural Networks", "Model Deployment", "Data Processing", "Research"],
    deadline: new Date(Date.now() + 48 * 24 * 60 * 60 * 1000),
    requirements: "Master's or PhD in Computer Science, AI, or related field. 3+ years of ML engineering experience. Strong proficiency in Python. Experience with TensorFlow and PyTorch. Knowledge of NLP and deep learning. Understanding of model deployment. Familiarity with MLOps practices. Published research papers preferred.",
    responsibilities: "Build and train ML models. Implement NLP solutions. Deploy models to production. Optimize model performance. Conduct research and experiments. Collaborate with data scientists. Monitor model metrics. Stay updated with latest research. Implement state-of-the-art techniques.",
    benefits: "Competitive salary, significant equity, health insurance, 401k matching, relocation assistance, research budget, conference attendance, GPU resources.",
    salaryMin: 140000,
    salaryMax: 200000,
    experienceLevel: 3,
  },
];

export default async function seed() {
  for (const role of roles) {
    await prisma.roles.upsert({
      where: { code: role.code },
      update: role,
      create: role,
    });
  }
  await prisma.applicationstatus.upsert({
    where: { code: "PENDING" },
    update: { name: "PENDING" },
    create: { name: "PENDING", code: "PENDING" },
  })
  await prisma.applicationstatus.upsert({
    where: { code: "GRANTED" },
    update: { name: "GRANTED" },
    create: { name: "GRANTED", code: "GRANTED" },
  })

  // Seed job types if not already present (by name)
  for (const jobType of jobTypes) {
    const existing = await prisma.jobtypes.findFirst({
      where: { name: jobType.name },
    });
    if (!existing) {
      await prisma.jobtypes.create({ data: jobType });
    }
  }

  // Seed company types if not already present (by name)
  for (const companyType of companyTypes) {
    const existing = await prisma.companyTypes.findFirst({
      where: { name: companyType.name },
    });
    if (!existing) {
      await prisma.companyTypes.create({ data: companyType });
    }
  }

  // Seed email templates using upsert on unique code
  for (const template of emailTemplates) {
    await prisma.emailTemplates.upsert({
      where: { code: template.code },
      update: {
        name: template.name,
        subject: template.subject,
        body: template.body,
        description: template.description,
      },
      create: template,
    });
  }

  // Seed default company settings for all existing companies, per key
  const companies = await prisma.companies.findMany({
    select: { id: true },
  });

  for (const company of companies) {
    for (const setting of companySettingsDefaults) {
      const existingSetting = await prisma.companySettings.findFirst({
        where: {
          companyId: company.id,
          key: setting.key,
        },
      });

      if (!existingSetting) {
        await prisma.companySettings.create({
          data: {
            companyId: company.id,
            key: setting.key,
            value: setting.value,
            isSystemSetting: setting.isSystemSetting,
          },
        });
      }
    }
  }

  // Seed example jobs for companies that don't have any yet
  const jobTypesInDb = await prisma.jobtypes.findMany({
    select: { id: true, name: true },
  });

  if (jobTypesInDb.length === 0) {
    console.warn("No job types found – skipping job seeding.");
    return;
  }

  const defaultJobTypeId =
    jobTypesInDb.find((jt) => jt.name === "full-time")?.id ??
    jobTypesInDb[0]?.id;
}
async function createUsers() {
  const usersToCreate: { email: string; roleCode: string }[] = [
    { email: "biplovthapa890@gmail.com", roleCode: "RECRUITER" },
    { email: "biplovthapa80@gmail.com", roleCode: "CANDIDATE" },
    { email: "biplovthapa456@gmail.com", roleCode: "ADMIN" },
  ];

  for (const { email, roleCode } of usersToCreate) {
    // Skip if user already exists (idempotent)
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });
    if (existingUser) continue;

    const role = await prisma.roles.findUnique({
      where: { code: roleCode },
    });

    if (!role) {
      console.warn(`Role with code ${roleCode} not found, skipping user ${email}`);
      continue;
    }

    await prisma.users.create({
      data: {
        email,
        name: email.split("@")[0],
        password: Math.random().toString(36).substring(2, 15),
        role: {
          connect: {
            id: role.id,
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  // Create company for recruiter
  const recruiter = await prisma.users.findUnique({
    where: { email: "biplovthapa890@gmail.com" },
    select: { id: true },
  });

  console.log("Recruiter found:", recruiter);

  if (recruiter) {
    const existingCompany = await prisma.companies.findFirst({
      where: { userId: recruiter.id },
    });

    console.log("Existing company:", existingCompany);

    if (!existingCompany) {
      let companyType = await prisma.companyTypes.findFirst({
        where: { name: "Startup" },
      });

      console.log("Company type found:", companyType);

      if (!companyType) {
        companyType = await prisma.companyTypes.create({
          data: {
            name: "Startup",
            description: "Early-stage or growth-stage company",
          },
        });
        console.log("Created company type:", companyType);
      }

      const newCompany = await prisma.companies.create({
        data: {
          name: "Tech Innovations Pvt Ltd",
          website: "https://techinnovations.com",
          email: "contact@techinnovations.com",
          isVerified: true,
          postlimit: 50,
          user: {
            connect: {
              id: recruiter.id,
            },
          },
          companytype: {
            connect: {
              id: companyType.id,
            },
          },
        },
      });
      console.log("Created company:", newCompany);

      // Seed jobs for the company
      const jobTypesInDb = await prisma.jobtypes.findMany({
        select: { id: true, name: true },
      });

      console.log("Job types found:", jobTypesInDb.length);

      const defaultJobTypeId =
        jobTypesInDb.find((jt) => jt.name === "full-time")?.id ??
        jobTypesInDb[0]?.id;

      console.log("Default job type ID:", defaultJobTypeId);

      if (defaultJobTypeId) {
        const company = await prisma.companies.findFirst({
          where: { userId: recruiter.id },
          select: { id: true },
        });

        console.log("Company for jobs:", company);

        if (company) {
          await prisma.jobs.createMany({
            data: sampleJobs.map((job) => ({
              title: job.title,
              description: job.description,
              companyId: company.id,
              jobtypeId: defaultJobTypeId,
              location: job.location,
              isRemote: job.isRemote,
              skills: job.skills,
              deadline: job.deadline,
              postedBy: recruiter.id,
              requirements: job.requirements,
              responsibilities: job.responsibilities,
              benefits: job.benefits,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              experienceLevel: job.experienceLevel,
            })),
          });
          console.log(`Seeded ${sampleJobs.length} jobs for recruiter's company`);

          // Generate embeddings for seeded jobs
          const jobs = await prisma.jobs.findMany({
            where: { companyId: company.id },
            select: { id: true, title: true, description: true, requirements: true, responsibilities: true },
          });

          console.log(`Generating embeddings for ${jobs.length} jobs...`);
          for (const job of jobs) {
            const textToEmbed = [
              job.title,
              job.title,
              job.title,
              job.description || '',
              job.requirements || '',
              job.responsibilities || '',
            ].join(' ').trim();

            if (textToEmbed) {
              const embedding = await embed(textToEmbed);
              await prisma.jobs.update({
                where: { id: job.id },
                data: { embedding } as any,
              });
              console.log(`✓ Generated embedding for: ${job.title}`);
            }
          }
        }
      }
    } else {
      console.log("Company already exists, checking jobs...");
      const existingJobCount = await prisma.jobs.count({
        where: { companyId: existingCompany.id },
      });
      console.log(`Existing jobs: ${existingJobCount}`);

      // Check for jobs without embeddings - just get all and filter
      const allJobs = await prisma.jobs.findMany({
        where: { companyId: existingCompany.id },
        select: { id: true, title: true, description: true, requirements: true, responsibilities: true, embedding: true },
      });

      const jobsWithoutEmbeddings = allJobs.filter(job => !job.embedding || job.embedding.length === 0);

      if (jobsWithoutEmbeddings.length > 0) {
        console.log(`Found ${jobsWithoutEmbeddings.length} jobs without embeddings. Generating...`);
        for (const job of jobsWithoutEmbeddings) {
          const textToEmbed = [
            job.title,
            job.title,
            job.title,
            job.description || '',
            job.requirements || '',
            job.responsibilities || '',
          ].join(' ').trim();

          if (textToEmbed) {
            const embedding = await embed(textToEmbed);
            await prisma.jobs.update({
              where: { id: job.id },
              data: { embedding } as any,
            });
            console.log(`✓ Generated embedding for: ${job.title}`);
          }
        }
      }

      if (existingJobCount < 15) {
        // Seed jobs for existing company
        const jobTypesInDb = await prisma.jobtypes.findMany({
          select: { id: true, name: true },
        });

        const defaultJobTypeId =
          jobTypesInDb.find((jt) => jt.name === "full-time")?.id ??
          jobTypesInDb[0]?.id;

        if (defaultJobTypeId) {
          await prisma.jobs.createMany({
            data: sampleJobs.map((job) => ({
              title: job.title,
              description: job.description,
              companyId: existingCompany.id,
              jobtypeId: defaultJobTypeId,
              location: job.location,
              isRemote: job.isRemote,
              skills: job.skills,
              deadline: job.deadline,
              postedBy: recruiter.id,
              requirements: job.requirements,
              responsibilities: job.responsibilities,
              benefits: job.benefits,
              salaryMin: job.salaryMin,
              salaryMax: job.salaryMax,
              experienceLevel: job.experienceLevel,
            })),
          });
          console.log(`Seeded ${sampleJobs.length} jobs for existing company`);

          // Generate embeddings for seeded jobs
          const jobs = await prisma.jobs.findMany({
            where: { companyId: existingCompany.id },
            select: { id: true, title: true, description: true, requirements: true, responsibilities: true },
          });

          console.log(`Generating embeddings for ${jobs.length} jobs...`);
          for (const job of jobs) {
            const textToEmbed = [
              job.title,
              job.title,
              job.title,
              job.description || '',
              job.requirements || '',
              job.responsibilities || '',
            ].join(' ').trim();

            if (textToEmbed) {
              const embedding = await embed(textToEmbed);
              await prisma.jobs.update({
                where: { id: job.id },
                data: { embedding } as any,
              });
              console.log(`✓ Generated embedding for: ${job.title}`);
            }
          }
        }
      }
    }
  }
}

if (require.main === module) {
  (async () => {
    try {
      await seed();
      await createUsers();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Failed to seed database:", error);
      process.exit(1);
    } finally {
      await prisma.$disconnect();
    }
  })();
}