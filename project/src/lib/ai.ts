/**
 * Extended AI analysis engine — extractive NLP utilities for generating
 * structured summaries, quizzes, flashcards, and chat responses from text.
 * All processing is client-side with no external API dependency.
 */

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
  'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
  'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where',
  'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
  'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
  'very', 'just', 'also', 'as', 'if', 'then', 'else', 'about', 'into', 'over',
  'after', 'before', 'between', 'under', 'above', 'out', 'up', 'down', 'off',
  'again', 'here', 'there', 'now', 'your', 'their', 'its', 'our', 'my', 'me',
  'him', 'her', 'them', 'us', 'using', 'use', 'used', 'like', 'via', 'per',
  'via', 'etc', 'eg', 'ie', 'vs',
]);

export interface SummaryResult {
  keyPoints: string[];
  importantTopics: string[];
  formulas: string[];
  examTips: string[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedFlashcard {
  front: string;
  back: string;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[#*`>_~\-\[\]\(\)!]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function splitSentences(text: string): string[] {
  return text
    .replace(/[#*`>_~]/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function wordFreq(tokens: string[]): Map<string, number> {
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) || 0) + 1);
  return freq;
}

/** Generate a structured summary with key points, topics, formulas, and exam tips. */
export function generateStructuredSummary(text: string): SummaryResult {
  const cleanText = text.replace(/```[\s\S]*?```/g, ' ').trim();
  const sentences = splitSentences(cleanText);
  const tokens = tokenize(cleanText);
  const freq = wordFreq(tokens);
  const maxFreq = Math.max(...freq.values(), 1);

  // Score sentences
  const scored = sentences.map((sentence, index) => {
    const sTokens = tokenize(sentence);
    let score = 0;
    for (const t of sTokens) score += (freq.get(t) || 0) / maxFreq;
    score = score / Math.sqrt(sTokens.length || 1);
    score *= 1 + 0.1 * (1 - index / sentences.length);
    return { sentence, score, index };
  });

  // Key Points: top-scored sentences, rephrased as bullet points
  const keyPoints = scored
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.sentence.replace(/^(the|a|an|this|these|those)\s+/i, '').trim())
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .filter((s) => s.length > 10);

  // Important Topics: top frequency words that aren't too common
  const importantTopics = Array.from(freq.entries())
    .filter(([word, count]) => count >= 2 && word.length > 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  // Formulas: extract lines that look like mathematical/code formulas
  const formulaPatterns = [
    /[\w\s]*[=:][\w\s+\-*/.()^]+/g,
    /f\([\w,]+\)\s*=\s*[\w\s+\-*/.()^]+/g,
    /O\([\w^]+\)/g,
    /[\w]+\s*≤\s*[\w]+/g,
    /[\w]+\s*≥\s*[\w]+/g,
  ];
  const formulaSet = new Set<string>();
  for (const pattern of formulaPatterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      for (const m of matches) {
        const clean = m.trim();
        if (clean.length > 5 && clean.length < 100 && !clean.startsWith('http')) {
          formulaSet.add(clean);
        }
      }
    }
  }
  // Also extract code-like patterns
  const codeMatches = cleanText.match(/[a-zA-Z_]\w*\([^)]*\)/g);
  if (codeMatches) {
    for (const m of codeMatches) {
      if (m.length > 5 && m.length < 80) formulaSet.add(m);
    }
  }
  const formulas = Array.from(formulaSet).slice(0, 6);

  // Exam Tips: generate from patterns in the text
  const examTips: string[] = [];
  const lowerText = cleanText.toLowerCase();

  if (/(important|critical|essential|must|key|fundamental|crucial)/.test(lowerText)) {
    examTips.push('Focus on concepts described as "important", "critical", or "essential" — these are likely emphasized in exams.');
  }
  if (/(advantage|disadvantage|benefit|drawback|pro|con)/.test(lowerText)) {
    examTips.push('Review all advantages and disadvantages — comparison questions are common.');
  }
  if (/(example|instance|case)/.test(lowerText)) {
    examTips.push('Memorize concrete examples — they strengthen answers and show deeper understanding.');
  }
  if (/(difference|compare|versus|vs|contrast)/.test(lowerText)) {
    examTips.push('Be prepared to compare and contrast key concepts — structure these as tables.');
  }
  if (/(step|process|procedure|algorithm|sequence)/.test(lowerText)) {
    examTips.push('Know the step-by-step processes — flow-based questions test sequential understanding.');
  }
  if (/(definition|define|meaning|refers to)/.test(lowerText)) {
    examTips.push('Learn precise definitions — short-answer questions often test exact terminology.');
  }
  if (/(cause|effect|result|consequence|impact)/.test(lowerText)) {
    examTips.push('Understand cause-and-effect relationships — they appear in analytical questions.');
  }
  if (formulas.length > 0) {
    examTips.push('Practice all formulas and notation — memorize when and how to apply each one.');
  }
  if (examTips.length === 0) {
    examTips.push('Review the key points above and be ready to explain each in your own words.');
    examTips.push('Create flashcards from the important topics to reinforce recall.');
  }
  examTips.push('Time management: allocate your exam time proportionally to question point values.');

  return { keyPoints, importantTopics, formulas, examTips };
}

/** Generate quiz questions from text content. */
export function generateQuiz(text: string, difficulty: 'easy' | 'medium' | 'hard', count = 5): QuizQuestion[] {
  const sentences = splitSentences(text);
  const tokens = tokenize(text);
  const freq = wordFreq(tokens);
  const questions: QuizQuestion[] = [];

  // Strategy: find sentences with key terms and create fill-in-the-blank or definition questions
  const keyTerms = Array.from(freq.entries())
    .filter(([word, count]) => count >= 2 && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  const usedTerms = new Set<string>();

  for (const sentence of sentences) {
    if (questions.length >= count) break;
    const sTokens = tokenize(sentence);
    const termInSentence = sTokens.find((t) => keyTerms.includes(t) && !usedTerms.has(t));
    if (!termInSentence) continue;

    usedTerms.add(termInSentence);

    // Create a fill-in-the-blank question
    const blanked = sentence.replace(
      new RegExp(`\\b${termInSentence}\\b`, 'i'),
      '_____'
    );

    // Generate distractors from other key terms
    const distractors = keyTerms
      .filter((t) => t !== termInSentence && !usedTerms.has(t))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    if (distractors.length < 3) continue;

    const options = [termInSentence, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(termInSentence);

    let questionText = `Fill in the blank: ${blanked}`;
    if (difficulty === 'hard') {
      questionText = `Which term correctly completes this statement? "${blanked}"`;
    } else if (difficulty === 'easy') {
      questionText = `What word belongs in the blank? "${blanked}"`;
    }

    const explanation = difficulty === 'easy'
      ? `The answer is "${termInSentence}" based on the context of the sentence.`
      : `"${termInSentence}" fits the context because it relates to the other terms in the sentence.`;

    questions.push({
      question: questionText,
      options: options.map((o) => o.charAt(0).toUpperCase() + o.slice(1)),
      correctIndex,
      explanation,
    });
  }

  // If we couldn't generate enough, create definition-based questions
  while (questions.length < count && keyTerms.length > questions.length) {
    const remainingTerms = keyTerms.filter((t) => !usedTerms.has(t));
    if (remainingTerms.length < 4) break;

    const term = remainingTerms[0];
    usedTerms.add(term);

    // Find a sentence that mentions this term for context
    const contextSentence = sentences.find((s) => s.toLowerCase().includes(term));
    const definition = contextSentence
      ? contextSentence.replace(new RegExp(`\\b${term}\\b`, 'gi'), 'this concept').trim()
      : `A key concept related to the topic.`;

    const distractors = remainingTerms
      .filter((t) => t !== term)
      .slice(1, 4);

    if (distractors.length < 3) break;

    const options = [term, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.indexOf(term);

    questions.push({
      question: `Which term is described here: "${definition}"?`,
      options: options.map((o) => o.charAt(0).toUpperCase() + o.slice(1)),
      correctIndex,
      explanation: `"${term}" matches the description provided.`,
    });
  }

  return questions;
}

/** Generate flashcards from text content. */
export function generateFlashcards(text: string, count = 10): GeneratedFlashcard[] {
  const sentences = splitSentences(text);
  const tokens = tokenize(text);
  const freq = wordFreq(tokens);
  const cards: GeneratedFlashcard[] = [];
  const used = new Set<string>();

  // Key terms for definition cards
  const keyTerms = Array.from(freq.entries())
    .filter(([word, count]) => count >= 2 && word.length > 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  for (const term of keyTerms) {
    if (cards.length >= count) break;
    if (used.has(term)) continue;
    used.add(term);

    // Find the best sentence defining/describing this term
    const definingSentence = sentences.find((s) =>
      s.toLowerCase().includes(term) &&
      (s.toLowerCase().includes('is') || s.toLowerCase().includes('are') ||
       s.toLowerCase().includes('refers') || s.toLowerCase().includes('means') ||
       s.toLowerCase().includes('used') || s.toLowerCase().includes('allows') ||
       s.toLowerCase().includes('enables') || s.toLowerCase().includes('provides'))
    );

    const back = definingSentence
      ? definingSentence.trim()
      : `A key concept that appears frequently in this material, related to: ${Array.from(freq.entries())
          .filter(([w]) => w !== term && keyTerms.slice(0, 5).includes(w))
          .slice(0, 3)
          .map(([w]) => w)
          .join(', ')}.`;

    cards.push({
      front: `What is ${term}?`,
      back: back.charAt(0).toUpperCase() + back.slice(1),
    });
  }

  // Fill remaining with question-answer pairs from sentences
  for (const sentence of sentences) {
    if (cards.length >= count) break;
    const sTokens = tokenize(sentence);
    if (sTokens.length < 5) continue;

    // Use the most frequent word in the sentence as the answer
    const topWord = sTokens
      .filter((t) => !used.has(t) && keyTerms.includes(t))
      .sort((a, b) => (freq.get(b) || 0) - (freq.get(a) || 0))[0];

    if (!topWord) continue;
    used.add(topWord);

    const blanked = sentence.replace(
      new RegExp(`\\b${topWord}\\b`, 'i'),
      '_____'
    );

    cards.push({
      front: `Fill in the blank: ${blanked}`,
      back: topWord.charAt(0).toUpperCase() + topWord.slice(1),
    });
  }

  return cards;
}

/** Generate a chat response based on the user's message and optional context. */
export function generateChatResponse(userMessage: string, context?: string): string {
  const lower = userMessage.toLowerCase();

  // Greeting patterns
  if (/^(hi|hello|hey|greetings|good (morning|afternoon|evening))/i.test(userMessage.trim())) {
    return "Hello! I'm your AI study assistant. I can help you understand engineering concepts, explain topics from your notes, and answer questions about technology. What would you like to explore?";
  }

  // Help / capabilities
  if (/(help|what can you do|capabilities|features)/.test(lower)) {
    return "I can help you with:\n\n• **Explaining concepts** — ask me about any engineering topic\n• **Summarizing content** — paste text and I'll extract key points\n• **Generating quizzes** — I'll create practice questions from your material\n• **Creating flashcards** — I'll turn your notes into study cards\n• **Answering questions** — from algorithms to system design\n\nJust ask me anything!";
  }

  // Definition questions
  const defineMatch = lower.match(/(?:what is|what are|define|explain|describe)\s+(.+)/);
  if (defineMatch) {
    const topic = defineMatch[1].replace(/\?/g, '').trim();
    return generateTopicExplanation(topic, context);
  }

  // How-to questions
  if (/^(how do|how to|how can|how does)/.test(lower)) {
    return generateHowToResponse(userMessage, context);
  }

  // Comparison questions
  if (/(difference between|compare|vs|versus)/.test(lower)) {
    return generateComparisonResponse(userMessage, context);
  }

  // Why questions
  if (/^why/.test(lower)) {
    return `That's a great question. The reasoning behind this involves several factors:\n\n1. **Design principles** — the approach follows established engineering patterns that prioritize reliability and maintainability.\n\n2. **Trade-offs** — every engineering decision balances competing concerns like performance, simplicity, and scalability.\n\n3. **Real-world constraints** — practical considerations often dictate which solution works best in a given context.\n\nWould you like me to dive deeper into any specific aspect of this?`;
  }

  // Default: contextual response
  if (context) {
    return generateContextualResponse(userMessage, context);
  }

  return `That's an interesting topic. Let me share what I know:\n\n${generateTopicExplanation(userMessage.replace(/\?/g, '').trim(), context)}\n\nWould you like me to elaborate on any part of this, or do you have a follow-up question?`;
}

function generateTopicExplanation(topic: string, context?: string): string {
  const cleanTopic = topic.replace(/^(the|a|an)\s+/, '').trim();

  // Check if context contains relevant information
  if (context) {
    const contextLower = context.toLowerCase();
    const topicLower = cleanTopic.toLowerCase();
    const sentences = splitSentences(context);
    const relevant = sentences.filter((s) =>
      s.toLowerCase().includes(topicLower) ||
      s.toLowerCase().split(/\s+/).some((w) => topicLower.includes(w) && w.length > 4)
    );

    if (relevant.length > 0) {
      return `Based on the material you've provided:\n\n${relevant.slice(0, 3).join('\n\n')}\n\n**Key takeaway:** ${cleanTopic} is an important concept in this context. The material describes it in terms of its properties, applications, and relationship to other concepts.`;
    }
  }

  // General engineering knowledge responses
  const topicLower = cleanTopic.toLowerCase();

  if (topicLower.includes('react') || topicLower.includes('component')) {
    return `**${cleanTopic}** is a key concept in frontend development.\n\nReact components are the building blocks of React applications. They are reusable, self-contained pieces of UI that manage their own state and render based on props. Key aspects include:\n\n• **Functional components** — modern React uses functions with hooks\n• **Props** — read-only data passed from parent to child\n• **State** — internal data managed with useState\n• **Lifecycle** — handled via useEffect hook\n\nComponents promote reusability, separation of concerns, and predictable UI updates through the virtual DOM.`;
  }

  if (topicLower.includes('docker') || topicLower.includes('container')) {
    return `**${cleanTopic}** relates to containerization technology.\n\nDocker containers package an application and its dependencies into a standardized unit that runs consistently across environments. Key points:\n\n• **Images** — read-only templates used to create containers\n• **Containers** — running instances of images\n• **Dockerfile** — text file with instructions to build an image\n• **Portability** — runs the same on any machine with Docker\n• **Isolation** — each container runs in its own environment\n\nThis solves the "it works on my machine" problem by bundling everything the app needs.`;
  }

  if (topicLower.includes('database') || topicLower.includes('sql') || topicLower.includes('index')) {
    return `**${cleanTopic}** is a database engineering concept.\n\nDatabases store and retrieve structured data efficiently. Key aspects:\n\n• **Relational model** — data organized in tables with rows and columns\n• **SQL** — standard query language for relational databases\n• **Indexing** — speeds up queries by creating lookup structures\n• **Normalization** — reduces redundancy by organizing data\n• **ACID properties** — Atomicity, Consistency, Isolation, Durability\n\nProper database design is critical for application performance and data integrity.`;
  }

  if (topicLower.includes('algorithm') || topicLower.includes('complexity') || topicLower.includes('big')) {
    return `**${cleanTopic}** is a fundamental concept in computer science.\n\nAlgorithm analysis evaluates the efficiency of algorithms in terms of time and space complexity:\n\n• **Big O notation** — describes upper bound on growth rate\n• **Time complexity** — how runtime scales with input size\n• **Space complexity** — how memory usage scales\n• **Common complexities** — O(1), O(log n), O(n), O(n log n), O(n²)\n\nUnderstanding complexity helps you choose the right algorithm for a problem and predict how it will perform at scale.`;
  }

  // Generic but structured response
  return `**${cleanTopic}** is an important engineering concept. Here's a structured overview:\n\n**Definition:** ${cleanTopic} refers to a key principle or technique used in software engineering and computer science.\n\n**Why it matters:** Understanding ${cleanTopic} helps engineers make better design decisions, write more maintainable code, and build systems that scale effectively.\n\n**Key aspects to study:**\n• Core principles and terminology\n• Common use cases and applications\n• Advantages and limitations\n• How it relates to other concepts\n\nWould you like me to explain any specific aspect in more detail?`;
}

function generateHowToResponse(message: string, context?: string): string {
  const topic = message.replace(/^(how do|how to|how can|how does)\s+/i, '').replace(/\?/g, '').trim();

  return `Here's a step-by-step approach to **${topic}**:\n\n1. **Understand the goal** — clearly define what you're trying to achieve and the constraints involved.\n\n2. **Gather requirements** — identify inputs, outputs, performance needs, and edge cases.\n\n3. **Choose the right approach** — evaluate options based on simplicity, performance, and maintainability.\n\n4. **Implement incrementally** — build in small steps, testing each part before moving on.\n\n5. **Test and iterate** — verify correctness with different inputs and refine as needed.\n\n6. **Document** — record decisions and rationale for future reference.\n\nThis systematic approach helps ensure you build a robust solution. Would you like more specific guidance on any step?`;
}

function generateComparisonResponse(message: string, context?: string): string {
  const parts = message
    .replace(/(difference between|compare|vs|versus)/i, '')
    .replace(/\?/g, '')
    .split(/\s+and\s+|\s*,\s*/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (parts.length >= 2) {
    return `Here's a comparison of **${parts[0]}** and **${parts[1]}**:\n\n| Aspect | ${parts[0]} | ${parts[1]} |\n|--------|---------|----------|\n| Primary use | Optimized for specific scenarios | Alternative approach with different trade-offs |\n| Complexity | Varies based on context | Different complexity profile |\n| Performance | Strong in certain conditions | Strong in other conditions |\n| Best for | When requirements match its strengths | When requirements favor its approach |\n\n**When to choose each:**\n• Use **${parts[0]}** when you need its specific advantages\n• Use **${parts[1]}** when its characteristics better fit your needs\n\nBoth are valid tools — the right choice depends on your specific requirements. Would you like me to elaborate?`;
  }

  return `When comparing technologies or concepts, consider these dimensions:\n\n• **Performance** — speed, memory usage, scalability\n• **Complexity** — learning curve, maintenance burden\n• **Ecosystem** — community, tooling, libraries\n• **Use cases** — where each excels and falls short\n• **Trade-offs** — what you gain and what you sacrifice\n\nWhat specific aspects would you like me to compare?`;
}

function generateContextualResponse(message: string, context: string): string {
  const sentences = splitSentences(context);
  const messageTokens = tokenize(message);
  const contextFreq = wordFreq(tokenize(context));

  // Score context sentences by relevance to the message
  const scored = sentences.map((sentence, index) => {
    const sTokens = tokenize(sentence);
    let score = 0;
    for (const t of messageTokens) {
      if (sTokens.includes(t)) score += 2;
    }
    return { sentence, score, index };
  });

  const relevant = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => a.index - b.index);

  if (relevant.length > 0) {
    return `Based on your notes, here's what I found relevant to your question:\n\n${relevant.map((r) => r.sentence).join('\n\n')}\n\n**Summary:** The material discusses this topic in the context above. Let me know if you'd like me to explain any part in more detail.`;
  }

  return generateTopicExplanation(message.replace(/\?/g, '').trim(), context);
}

/** Suggested chat prompts for the empty state. */
export const SUGGESTED_PROMPTS = [
  { icon: 'lightbulb', text: 'Explain Big O notation in simple terms' },
  { icon: 'code', text: 'What is a React Server Component?' },
  { icon: 'database', text: 'How do database indexes work?' },
  { icon: 'container', text: 'Compare Docker containers vs virtual machines' },
  { icon: 'git', text: 'Explain git rebase vs merge' },
  { icon: 'zap', text: 'What is the CAP theorem?' },
];

/* ------------------------------------------------------------------ */
/* Note-level AI helpers used by the engineering notes editor          */
/* ------------------------------------------------------------------ */

const TAG_KEYWORDS: Record<string, string[]> = {
  react: ['react', 'jsx', 'tsx', 'hook', 'useState', 'useEffect', 'component'],
  typescript: ['typescript', 'ts', 'interface', 'type', 'generic'],
  javascript: ['javascript', 'js', 'es6', 'promise', 'async', 'await'],
  python: ['python', 'py', 'pip', 'django', 'flask'],
  docker: ['docker', 'container', 'dockerfile', 'image'],
  kubernetes: ['kubernetes', 'k8s', 'pod', 'cluster', 'helm'],
  postgresql: ['postgres', 'postgresql', 'sql', 'query', 'index'],
  redis: ['redis', 'cache', 'key-value'],
  performance: ['performance', 'optimization', 'speed', 'latency', 'benchmark'],
  testing: ['test', 'testing', 'jest', 'cypress', 'unit', 'integration'],
  git: ['git', 'commit', 'branch', 'merge', 'rebase'],
  css: ['css', 'tailwind', 'style', 'flexbox', 'grid'],
  nodejs: ['node', 'nodejs', 'npm', 'express'],
  api: ['api', 'rest', 'graphql', 'endpoint'],
  security: ['security', 'auth', 'jwt', 'oauth', 'encryption'],
  ml: ['model', 'training', 'neural', 'dataset', 'tensor'],
  algorithms: ['algorithm', 'complexity', 'big-o', 'sort', 'search'],
  architecture: ['architecture', 'design', 'pattern', 'system'],
  deployment: ['deploy', 'deployment', 'ci', 'cd', 'pipeline'],
  database: ['database', 'db', 'schema', 'migration', 'table'],
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Frontend: ['react', 'vue', 'angular', 'css', 'html', 'tailwind', 'ui', 'ux', 'dom', 'component', 'hook', 'state', 'render', 'browser', 'frontend', 'javascript', 'typescript', 'webpack', 'vite', 'spa'],
  Backend: ['api', 'server', 'endpoint', 'rest', 'graphql', 'node', 'express', 'django', 'flask', 'spring', 'middleware', 'request', 'response', 'controller', 'service', 'backend', 'microservice'],
  DevOps: ['docker', 'kubernetes', 'k8s', 'ci', 'cd', 'pipeline', 'deploy', 'deployment', 'terraform', 'ansible', 'jenkins', 'github', 'actions', 'container', 'helm', 'devops', 'nginx'],
  Database: ['sql', 'postgres', 'postgresql', 'mysql', 'mongodb', 'redis', 'index', 'query', 'schema', 'migration', 'table', 'join', 'database', 'db', 'nosql', 'transaction', 'acid'],
  'Machine Learning': ['model', 'training', 'dataset', 'neural', 'network', 'learning', 'tensor', 'gradient', 'loss', 'accuracy', 'pytorch', 'tensorflow', 'ml', 'ai', 'inference', 'embedding'],
  Security: ['security', 'auth', 'authentication', 'authorization', 'oauth', 'jwt', 'token', 'encryption', 'vulnerability', 'xss', 'csrf', 'injection', 'tls', 'ssl', 'password', 'hash'],
  Algorithms: ['algorithm', 'complexity', 'sort', 'search', 'tree', 'graph', 'dynamic', 'recursion', 'iteration', 'big', 'notation', 'binary', 'hash', 'table', 'queue', 'stack', 'heap'],
  Systems: ['system', 'architecture', 'distributed', 'concurrency', 'thread', 'process', 'memory', 'cpu', 'cache', 'kernel', 'os', 'linux', 'filesystem', 'network', 'latency', 'throughput'],
  Mobile: ['mobile', 'ios', 'android', 'react', 'native', 'flutter', 'swift', 'kotlin', 'app', 'device', 'screen', 'touch', 'gesture', 'push', 'notification'],
};

/** Generate a concise extractive summary from note content. */
export function generateSummary(content: string, maxSentences = 2): string {
  const cleanText = content
    .replace(/[#*`>_~]/g, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .trim();

  if (!cleanText) return '';

  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  if (sentences.length <= maxSentences) return sentences.join(' ');

  const tokens = tokenize(cleanText);
  const freq = wordFreq(tokens);
  const maxFreq = Math.max(...freq.values(), 1);

  const scored = sentences.map((sentence, index) => {
    const sTokens = tokenize(sentence);
    let score = 0;
    for (const token of sTokens) score += (freq.get(token) || 0) / maxFreq;
    score = score / Math.sqrt(sTokens.length || 1);
    score *= 1 + 0.15 * (1 - index / sentences.length);
    return { sentence, score, index };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, maxSentences).sort((a, b) => a.index - b.index);
  return selected.map((s) => s.sentence).join(' ');
}

/** Suggest tags based on keyword matching against the content. */
export function suggestTags(content: string, existingTags: string[] = []): string[] {
  const lowerContent = content.toLowerCase();
  const suggested: string[] = [];

  for (const [tag, keywords] of Object.entries(TAG_KEYWORDS)) {
    if (existingTags.includes(tag)) continue;
    const matchCount = keywords.filter((kw) => lowerContent.includes(kw)).length;
    if (matchCount >= 2 || (matchCount >= 1 && keywords[0] === tag)) {
      suggested.push(tag);
    }
  }

  return suggested.slice(0, 5);
}

/** Predict the best-matching category based on content keywords. */
export function predictCategory(content: string, currentCategory?: string): string {
  const lowerContent = content.toLowerCase();
  const scores: Record<string, number> = {};

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    scores[category] = keywords.filter((kw) => lowerContent.includes(kw)).length;
  }

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best && best[1] >= 2) return best[0];
  return currentCategory || 'General';
}

/** Calculate a relatedness score between two notes based on shared tags + content overlap. */
export function relatednessScore(
  noteA: { tags: string[]; content: string },
  noteB: { tags: string[]; content: string }
): number {
  const setA = new Set(noteA.tags.map((t) => t.toLowerCase()));
  const setB = new Set(noteB.tags.map((t) => t.toLowerCase()));
  let tagOverlap = 0;
  for (const tag of setA) if (setB.has(tag)) tagOverlap++;

  const tokensA = new Set(tokenize(noteA.content));
  const tokensB = new Set(tokenize(noteB.content));
  let contentOverlap = 0;
  for (const token of tokensA) if (tokensB.has(token)) contentOverlap++;

  return tagOverlap * 3 + contentOverlap * 0.1;
}

/** Return the most related notes for a given note. */
export function findRelatedNotes(
  target: { tags: string[]; content: string; id: string },
  allNotes: { id: string; tags: string[]; content: string }[],
  limit = 3
): { id: string; score: number }[] {
  return allNotes
    .filter((n) => n.id !== target.id)
    .map((n) => ({ id: n.id, score: relatednessScore(target, n) }))
    .filter((n) => n.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Estimate reading time in minutes from word count. */
export function readingTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200));
}

/* ------------------------------------------------------------------ */
/* AI Translation                                                      */
/* ------------------------------------------------------------------ */

export type TranslationLang = 'en' | 'hi' | 'mr';

export const TRANSLATION_LANGUAGES: { code: TranslationLang; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳' },
];

/** Translate markdown text while preserving code blocks and inline code. */
export async function translateNoteContent(
  content: string,
  targetLang: TranslationLang
): Promise<string> {
  if (!content.trim()) return content;

  const segments = splitMarkdownSegments(content);
  const translated: string[] = [];

  for (const seg of segments) {
    if (seg.type === 'code') {
      translated.push(seg.text);
    } else {
      const result = await translateSegment(seg.text, targetLang);
      translated.push(result);
    }
  }

  return translated.join('');
}

interface Segment {
  type: 'text' | 'code';
  text: string;
}

function splitMarkdownSegments(content: string): Segment[] {
  const segments: Segment[] = [];
  const codeBlockRegex = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: 'code', text: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({ type: 'text', text: content.slice(lastIndex) });
  }

  if (segments.length === 0) {
    segments.push({ type: 'text', text: content });
  }

  return segments;
}

async function translateSegment(text: string, targetLang: TranslationLang): Promise<string> {
  if (!text.trim()) return text;

  // Protect inline code, links, and markdown syntax
  const placeholders: string[] = [];
  let protectedText = text;

  // Protect inline code
  protectedText = protectedText.replace(/`[^`]+`/g, (m) => {
    placeholders.push(m);
    return `__PH${placeholders.length - 1}__`;
  });

  // Protect markdown links [text](url) — translate only the text part
  protectedText = protectedText.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, linkText, url) => {
    placeholders.push(`[${linkText}](${url})`);
    return `__PH${placeholders.length - 1}__`;
  });

  // Split into chunks of ~480 chars to stay within MyMemory's free tier limit
  const chunks = protectedText.match(/[\s\S]{1,480}(?=\s|$)|[\s\S]{1,480}/g) || [protectedText];
  const translatedChunks: string[] = [];

  for (const chunk of chunks) {
    if (!chunk.trim()) {
      translatedChunks.push(chunk);
      continue;
    }
    try {
      const translated = await translateChunkViaMyMemory(chunk, targetLang);
      translatedChunks.push(translated);
    } catch {
      translatedChunks.push(chunk);
    }
  }

  let result = translatedChunks.join('');

  // Restore protected content
  result = result.replace(/__PH(\d+)__/g, (_, i) => placeholders[parseInt(i, 10)] || '');

  return result;
}

async function translateChunkViaMyMemory(text: string, targetLang: TranslationLang): Promise<string> {
  const langPair = `en|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Translation API returned ${res.status}`);

  const data = await res.json();
  const translated: string | undefined = data?.responseData?.translatedText;
  if (!translated) throw new Error('No translation returned');

  return translated;
}

/* ------------------------------------------------------------------ */
/* AI Code Explainer                                                   */
/* ------------------------------------------------------------------ */

export interface CodeExplanation {
  language: string;
  summary: string;
  howItWorks: string[];
  keyConcepts: { term: string; explanation: string }[];
  lineByLine: { line: string; explanation: string }[];
  complexity: { time: string; space: string };
  edgeCases: string[];
  improvements: string[];
}

const LANGUAGE_PATTERNS: { lang: string; patterns: RegExp[] }[] = [
  { lang: 'JavaScript', patterns: [/console\.log/, /\bconst\b/, /\blet\b/, /\bvar\b/, /=>/, /\bfunction\b/, /async\s/, /await\s/, /document\./, /window\./] },
  { lang: 'TypeScript', patterns: [/:\s*(string|number|boolean|any|void|never)\b/, /\binterface\b/, /\btype\b\s+\w+\s*=/, /<T>/, /\bas\s+\w+/] },
  { lang: 'Python', patterns: [/^\s*def\s/m, /^\s*class\s/m, /^\s*import\s/m, /^\s*from\s/m, /\bprint\(/, /\bself\b/, /\blambda\b/, /:\s*$/m] },
  { lang: 'Java', patterns: [/\bpublic\s+(class|static|void)\b/, /\bprivate\b/, /\bprotected\b/, /System\.out\.print/, /\bnew\s+\w+\(/, /throws\s/] },
  { lang: 'C++', patterns: [/#include\s*</, /std::/, /\bint\s+main\s*\(/, /cout\s*<</, /cin\s*>>/, /\bnamespace\b/] },
  { lang: 'C', patterns: [/#include\s*</, /\bprintf\s*\(/, /\bscanf\s*\(/, /\bmalloc\s*\(/, /\bstruct\b/, /\bint\s+main\s*\(/] },
  { lang: 'Go', patterns: [/\bpackage\s+main\b/, /\bfunc\s+main\s*\(/, /\bfmt\./, /\bgo\s+\w+/, /\bdefer\b/] },
  { lang: 'Rust', patterns: [/\bfn\s+/, /\blet\s+mut\b/, /\bmatch\s+/, /\bimpl\b/, /\bpub\b/, /::</, /\bOption</] },
  { lang: 'SQL', patterns: [/^\s*SELECT\b/im, /^\s*INSERT\b/im, /^\s*UPDATE\b/im, /^\s*DELETE\b/im, /^\s*CREATE\s+TABLE\b/im, /\bJOIN\b/i, /\bWHERE\b/i] },
  { lang: 'HTML', patterns: [/<html/i, /<div/i, /<span/i, /<body/i, /<head/i, /<!DOCTYPE/i] },
  { lang: 'CSS', patterns: [/\{[^}]*\}/, /:\s*(hover|active|focus|before|after)\b/, /@\w+/, /#\w+\s*\{/, /\.\w+\s*\{/] },
  { lang: 'Bash', patterns: [/^\s*#!/m, /\becho\b/, /\bcd\b/, /\bif\s*\[/, /\bfi\b/, /\bgrep\b/, /\bawk\b/, /\bsed\b/] },
];

function detectLanguage(code: string): string {
  let bestLang = 'Unknown';
  let bestScore = 0;
  for (const { lang, patterns } of LANGUAGE_PATTERNS) {
    let score = 0;
    for (const p of patterns) {
      if (p.test(code)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }
  return bestLang;
}

function countComplexity(code: string): { time: string; space: string } {
  const nestedLoops = (code.match(/\bfor\b|\bwhile\b|forEach|\.map\(|\.filter\(|\.reduce\(/g) || []).length;
  const fnNames = extractFunctions(code);
  const hasRecursion = fnNames.some((name) => {
    const re = new RegExp(`\\bfunction\\s+${name}\\b[\\s\\S]*?\\b${name}\\s*\\(`);
    return re.test(code);
  });
  const hasSorting = /\.sort\(|sort\(/.test(code);
  const hasHashMap = /Map\(|Set\(|\{\}|Object\.create|\.has\(|\.get\(/.test(code);

  if (hasRecursion && nestedLoops >= 2) return { time: 'O(n²) or worse', space: 'O(n) — call stack from recursion' };
  if (nestedLoops >= 2) return { time: 'O(n²)', space: 'O(1)' };
  if (hasSorting) return { time: 'O(n log n)', space: 'O(n)' };
  if (nestedLoops >= 1) return { time: 'O(n)', space: hasHashMap ? 'O(n)' : 'O(1)' };
  if (hasHashMap) return { time: 'O(n)', space: 'O(n)' };
  return { time: 'O(1)', space: 'O(1)' };
}

function extractFunctions(code: string): string[] {
  const patterns = [
    /(?:function\s+|const\s+|let\s+|var\s+)(\w+)\s*(?:=\s*)?(?:\([^)]*\)|function)/g,
    /def\s+(\w+)\s*\(/g,
    /(?:public|private|protected|static)?\s*(?:\w+\s+)+(\w+)\s*\([^)]*\)\s*\{/g,
    /fn\s+(\w+)\s*\(/g,
  ];
  const names: string[] = [];
  for (const p of patterns) {
    let m: RegExpExecArray | null;
    while ((m = p.exec(code)) !== null) {
      if (m[1] && !['if', 'for', 'while', 'switch', 'return', 'else', 'const', 'let', 'var'].includes(m[1])) {
        names.push(m[1]);
      }
    }
  }
  return [...new Set(names)];
}

const CONCEPT_KEYWORDS: { keywords: string[]; term: string; explanation: string }[] = [
  { keywords: ['async', 'await', 'promise', '.then('], term: 'Asynchronous Programming', explanation: 'Operations that run without blocking the main thread. The code uses async/await or Promises to handle values that will be available in the future.' },
  { keywords: ['=>', 'lambda', 'arrow'], term: 'Arrow / Lambda Function', explanation: 'A concise anonymous function. In JavaScript, arrow functions inherit `this` from the enclosing scope, unlike regular functions.' },
  { keywords: ['map(', 'filter(', 'reduce(', '.foreach'], term: 'Higher-Order Function', explanation: 'A function that takes or returns another function. These array methods iterate over collections declaratively.' },
  { keywords: ['class ', 'def ', 'struct ', 'impl '], term: 'Object-Oriented / Structured Design', explanation: 'The code organizes behavior into classes, structs, or named functions, encapsulating state and logic together.' },
  { keywords: ['try', 'catch', 'throw', 'except', 'error'], term: 'Error Handling', explanation: 'The code explicitly handles failure cases with try/catch blocks or error-returning patterns instead of letting errors propagate silently.' },
  { keywords: ['map(', 'set(', 'hashmap', 'dictionary', 'dict[', '{}'], term: 'Hash Map / Dictionary', explanation: 'A key-value data structure offering O(1) average lookups and inserts, used for fast data access by key.' },
  { keywords: ['sort(', '.sort('], term: 'Sorting', explanation: 'Arranging elements in order. Most built-in sort implementations run in O(n log n) time.' },
  { keywords: ['recursive', 'recursion', 'return self', 'return factor', 'return fib'], term: 'Recursion', explanation: 'A function that calls itself to break a problem into smaller sub-problems. Each call adds to the stack, so deep recursion can overflow.' },
  { keywords: ['import ', 'require(', '#include', 'from '], term: 'Module / Import System', explanation: 'The code pulls in external functionality from libraries or other modules rather than reimplementing everything.' },
  { keywords: ['export ', 'module.exports', 'pub '], term: 'Module Export', explanation: 'The code exposes its functionality for use by other modules, controlling what is public vs. private.' },
  { keywords: ['<T>', 'generic', 'template', 'type T'], term: 'Generics', explanation: 'A mechanism for writing code that works with any data type while maintaining type safety at compile time.' },
  { keywords: ['interface ', 'protocol ', 'trait '], term: 'Interface / Protocol', explanation: 'A contract that defines method signatures without implementation, enabling polymorphism and decoupled design.' },
  { keywords: ['select', 'insert', 'update', 'delete', 'join', 'where'], term: 'SQL Operations', explanation: 'Database query operations: SELECT retrieves data, INSERT adds rows, UPDATE modifies, DELETE removes, and JOIN combines tables.' },
  { keywords: ['pointer', '*ptr', '&ref', 'malloc', 'free('], term: 'Memory Management', explanation: 'Manual allocation and deallocation of memory. The programmer is responsible for freeing memory to avoid leaks.' },
  { keywords: ['useState', 'useEffect', 'useRef', 'useMemo', 'useCallback'], term: 'React Hook', explanation: 'A React function that taps into component state or lifecycle. Hooks must be called at the top level, never inside conditions or loops.' },
  { keywords: ['for ', 'while ', 'foreach', 'range('], term: 'Iteration / Loop', explanation: 'Repeating a block of code for each element in a collection or until a condition changes.' },
  { keywords: ['if ', 'else', 'switch', 'match '], term: 'Conditional Logic', explanation: 'Branching control flow — the code executes different paths depending on runtime conditions.' },
  { keywords: ['console.log', 'print(', 'printf', 'cout', 'fmt.print'], term: 'Output / Logging', explanation: 'Writing information to the console for debugging or user feedback. Not typically used in production logic.' },
];

export function explainCode(code: string): CodeExplanation {
  const language = detectLanguage(code);
  const lines = code.split('\n').filter((l) => l.trim().length > 0);
  const functions = extractFunctions(code);
  const complexity = countComplexity(code);

  // Summary
  const funcStr = functions.length > 0 ? ` It defines ${functions.length} function${functions.length > 1 ? 's' : ''} (${functions.slice(0, 3).join(', ')}${functions.length > 3 ? ', ...' : ''}).` : '';
  const summary = `This is a ${language} code snippet with ${lines.length} non-empty line${lines.length !== 1 ? 's' : ''}.${funcStr}`;

  // How it works — high-level steps
  const howItWorks: string[] = [];
  if (/^\s*import\b|^\s*from\b|^\s*#include|^\s*require\(/m.test(code)) {
    howItWorks.push('Imports necessary modules or libraries at the top of the file.');
  }
  if (functions.length > 0) {
    howItWorks.push(`Declares ${functions.length} function${functions.length > 1 ? 's' : ''}: ${functions.slice(0, 4).join(', ')}.`);
  }
  if (/\bclass\b|\bstruct\b|\bimpl\b/.test(code)) {
    howItWorks.push('Defines a class or struct that encapsulates data and behavior.');
  }
  if (/\bif\b|\belse\b|\bswitch\b|\bmatch\b/.test(code)) {
    howItWorks.push('Uses conditional branching to handle different cases.');
  }
  if (/\bfor\b|\bwhile\b|\.map\(|\.filter\(|\.forEach\(|\.reduce\(/.test(code)) {
    howItWorks.push('Iterates over data using loops or higher-order array methods.');
  }
  if (/async\b|await\b|\.then\(|Promise\(/.test(code)) {
    howItWorks.push('Handles asynchronous operations with async/await or Promises.');
  }
  if (/try\b|catch\b|except\b|throw\b/.test(code)) {
    howItWorks.push('Wraps risky operations in error-handling blocks.');
  }
  if (/console\.log|print\(|printf|cout|fmt\.print/.test(code)) {
    howItWorks.push('Produces output to the console for debugging or display.');
  }
  if (/return\b/.test(code)) {
    howItWorks.push('Returns computed results to the caller.');
  }
  if (howItWorks.length === 0) {
    howItWorks.push('Executes a sequence of statements to accomplish a specific task.');
  }

  // Key concepts
  const lowerCode = code.toLowerCase();
  const seenConcepts = new Set<string>();
  const keyConcepts: { term: string; explanation: string }[] = [];
  for (const { keywords, term, explanation } of CONCEPT_KEYWORDS) {
    if (seenConcepts.has(term)) continue;
    if (keywords.some((k) => lowerCode.includes(k.toLowerCase()))) {
      seenConcepts.add(term);
      keyConcepts.push({ term, explanation });
    }
  }

  // Line-by-line explanation for significant lines
  const lineByLine: { line: string; explanation: string }[] = [];
  const significantPatterns: { test: RegExp; explanation: (line: string) => string }[] = [
    { test: /^\s*import\b|^\s*from\b.*import/m, explanation: () => 'Imports a module — bringing external functionality into this file.' },
    { test: /^\s*#include\b/m, explanation: () => 'Includes a C/C++ header file with declarations needed for compilation.' },
    { test: /^\s*def\s+(\w+)/m, explanation: (l) => `Defines a Python function named "${l.match(/def\s+(\w+)/)?.[1]}" that can be called later.` },
    { test: /\bfunction\s+(\w+)/, explanation: (l) => `Declares a function named "${l.match(/function\s+(\w+)/)?.[1]}" with reusable logic.` },
    { test: /(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s)?\(?/, explanation: (l) => `Declares a variable or function named "${l.match(/(?:const|let|var)\s+(\w+)/)?.[1]}".` },
    { test: /\bclass\s+(\w+)/, explanation: (l) => `Defines a class named "${l.match(/class\s+(\w+)/)?.[1]}" — a blueprint for objects.` },
    { test: /\bstruct\s+(\w+)/, explanation: (l) => `Defines a struct named "${l.match(/struct\s+(\w+)/)?.[1]}" — a compound data type.` },
    { test: /^\s*if\b/, explanation: () => 'Begins a conditional block — executes only if the condition is true.' },
    { test: /^\s*else\b/, explanation: () => 'Alternative branch — executes when the preceding `if` condition was false.' },
    { test: /^\s*for\b/, explanation: () => 'Starts a loop that repeats a block for each element or a fixed number of times.' },
    { test: /^\s*while\b/, explanation: () => 'Repeats the block as long as the condition remains true.' },
    { test: /^\s*return\b/, explanation: () => 'Returns a value from the current function — execution stops here.' },
    { test: /console\.log|print\(|printf|cout\s*<</, explanation: () => 'Outputs a value to the console — commonly used for debugging or display.' },
    { test: /async\s+function|async\s+\w+\s*\(/, explanation: () => 'Marks this function as asynchronous — it returns a Promise and can use `await`.' },
    { test: /await\s+/, explanation: () => 'Pauses execution until an async operation completes, then yields its result.' },
    { test: /try\b/, explanation: () => 'Opens a protected block — errors inside will be caught by the matching `catch`.' },
    { test: /catch\b|except\b/, explanation: () => 'Handles errors thrown in the preceding `try` block.' },
    { test: /\.map\(/, explanation: () => 'Transforms each element in an array, producing a new array of the same length.' },
    { test: /\.filter\(/, explanation: () => 'Keeps only elements that pass the test condition, dropping the rest.' },
    { test: /\.reduce\(/, explanation: () => 'Accumulates array elements into a single value (e.g., a sum or grouped object).' },
    { test: /^\s*SELECT\b/i, explanation: () => 'SQL query — retrieves rows from one or more tables.' },
    { test: /console\.error|throw\b|raise\b/, explanation: () => 'Signals an error condition — either logs it or throws it for a handler to catch.' },
  ];
  for (const line of lines) {
    if (lineByLine.length >= 12) break;
    for (const { test, explanation } of significantPatterns) {
      if (test.test(line)) {
        lineByLine.push({ line: line.trim().slice(0, 80), explanation: explanation(line) });
        break;
      }
    }
  }

  // Edge cases
  const edgeCases: string[] = [];
  if (!/try\b|catch\b|except\b/.test(code) && /await\b|fetch\(|readFile|fs\.|open\(/.test(code)) {
    edgeCases.push('No error handling around async/file operations — failures will be unhandled.');
  }
  if (/parseInt|parseFloat|Number\(/.test(code) && !/isNaN|isFinite|Number\.is/.test(code)) {
    edgeCases.push('String-to-number conversion without validation — NaN or Infinity could propagate silently.');
  }
  if (/\[\]\.length|\.length\s*-\s*1/.test(code) && !/\blength\s*[<>=!]/.test(code)) {
    edgeCases.push('Array access without bounds checking — could produce undefined or out-of-bounds errors on empty arrays.');
  }
  if (/\.sort\(\)/.test(code) && !/\.sort\(\(/.test(code)) {
    edgeCases.push('Default sort converts to strings — numeric arrays may sort lexicographically (e.g., "10" before "2").');
  }
  if (/==(?!=)/.test(code) && language === 'JavaScript') {
    edgeCases.push('Uses loose equality (==) which performs type coercion — consider strict equality (===) to avoid surprises.');
  }
  if (/var\s/.test(code) && language === 'JavaScript') {
    edgeCases.push('Uses `var` which is function-scoped and hoisted — `let` or `const` are safer for block scoping.');
  }
  if (/console\.log/.test(code) && !/error|warn/.test(code)) {
    edgeCases.push('Console logging present — remove before production or replace with a proper logger.');
  }
  if (edgeCases.length === 0) {
    edgeCases.push('No obvious edge-case issues detected — consider testing with empty inputs, nulls, and extreme values.');
  }

  // Improvements
  const improvements: string[] = [];
  if (/var\s/.test(code) && language === 'JavaScript') {
    improvements.push('Replace `var` with `const` or `let` for predictable block scoping.');
  }
  if (/==(?!=)/.test(code) && (language === 'JavaScript' || language === 'TypeScript')) {
    improvements.push('Use strict equality `===` instead of `==` to avoid type coercion bugs.');
  }
  if (!/\/\/|\/\*|#.*$/m.test(code)) {
    improvements.push('Add comments to explain non-obvious logic and intent.');
  }
  if (functions.length > 0 && !/export\b|module\.exports/.test(code)) {
    improvements.push('Consider exporting functions if they need to be reused in other modules.');
  }
  if (/console\.log/.test(code)) {
    improvements.push('Replace console.log with a configurable logger for production environments.');
  }
  if (/\.forEach\(|\.map\(/.test(code) && /await\b/.test(code)) {
    improvements.push('`forEach` and `map` don\'t await async callbacks — use `for...of` with `await` for sequential async iteration.');
  }
  if (/any\b/.test(code) && language === 'TypeScript') {
    improvements.push('Avoid `any` — use specific types or `unknown` to preserve type safety.');
  }
  if (improvements.length === 0) {
    improvements.push('The code looks well-structured — consider adding unit tests to verify correctness.');
  }

  return { language, summary, howItWorks, keyConcepts, lineByLine, complexity, edgeCases, improvements };
}
