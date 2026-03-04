import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || '',
});

async function chatCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await groq.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || '';
}

// ===== RESUME PARSING =====

export async function parseResume(resumeText: string) {
    const systemPrompt = `You are an AI resume parser. Extract structured information from the resume text.
Return a JSON object with these fields:
{
  "skills": ["skill1", "skill2", ...],
  "experience": [{"title": "...", "company": "...", "startDate": "...", "endDate": "...", "current": false, "description": "..."}],
  "education": [{"degree": "...", "institution": "...", "year": 2020, "field": "..."}],
  "summary": "A 2-3 sentence professional summary"
}
Return ONLY valid JSON, no markdown or extra text.`;

    const result = await chatCompletion(systemPrompt, resumeText);

    try {
        return JSON.parse(result);
    } catch {
        return {
            skills: [],
            experience: [],
            education: [],
            summary: 'Unable to parse resume automatically. Please update your profile manually.',
        };
    }
}

// ===== JOB MATCHING =====

export async function generateMatchScore(job: any, candidate: any): Promise<number> {
    const systemPrompt = `You are an AI job matching system. Compare the candidate profile to the job requirements.
Return ONLY a JSON object: {"score": <number 0-100>, "reasoning": "<brief explanation>"}
Score based on: skill overlap, experience level match, and overall fit.`;

    const userPrompt = `Job:
Title: ${job.title}
Required Skills: ${job.skills?.join(', ')}
Experience Required: ${job.experienceMin || 0}-${job.experienceMax || 10} years
Location: ${job.location}
Work Type: ${job.workType}

Candidate:
Skills: ${candidate.skills?.join(', ')}
Summary: ${candidate.aiSummary || candidate.summary || 'N/A'}
Experience: ${JSON.stringify(candidate.experience)}
Location Preference: ${candidate.locationPreference || 'Any'}`;

    const result = await chatCompletion(systemPrompt, userPrompt);

    try {
        const parsed = JSON.parse(result);
        return Math.min(100, Math.max(0, parsed.score));
    } catch {
        return 50; // Default score
    }
}

// ===== INTERVIEW QUESTIONS =====

export async function generateInterviewQuestions(job: any, candidate: any) {
    const systemPrompt = `You are an AI interviewer. Generate interview questions for a candidate applying to a job.
Return a JSON array of 5 questions:
[
  {"id": "q1", "question": "...", "category": "TECHNICAL"},
  {"id": "q2", "question": "...", "category": "COMMUNICATION"},
  {"id": "q3", "question": "...", "category": "PROBLEM_SOLVING"},
  {"id": "q4", "question": "...", "category": "TECHNICAL"},
  {"id": "q5", "question": "...", "category": "TECHNICAL"}
]
Categories: TECHNICAL, COMMUNICATION, PROBLEM_SOLVING.
Make questions specific to the job and candidate background.
Return ONLY valid JSON.`;

    const userPrompt = `Job: ${job.title} at ${job.company?.name || 'Company'}
Required Skills: ${job.skills?.join(', ')}
Job Description: ${job.description}

Candidate Skills: ${candidate.skills?.join(', ')}
Candidate Summary: ${candidate.aiSummary || candidate.summary || 'N/A'}`;

    const result = await chatCompletion(systemPrompt, userPrompt);

    try {
        return JSON.parse(result);
    } catch {
        return [
            { id: 'q1', question: 'Tell me about your relevant experience for this role.', category: 'COMMUNICATION' },
            { id: 'q2', question: 'What technical skills do you bring to this position?', category: 'TECHNICAL' },
            { id: 'q3', question: 'Describe a challenging problem you solved recently.', category: 'PROBLEM_SOLVING' },
            { id: 'q4', question: 'How do you stay updated with the latest technologies?', category: 'TECHNICAL' },
            { id: 'q5', question: 'Where do you see yourself in the next 2-3 years?', category: 'COMMUNICATION' },
        ];
    }
}

// ===== INTERVIEW EVALUATION =====

export async function evaluateInterview(questions: any[], answers: any[], job: any) {
    const systemPrompt = `You are an AI interview evaluator. Evaluate candidate answers to interview questions.
Return a JSON object:
{
  "evaluatedQuestions": [
    {"id": "q1", "question": "...", "answer": "...", "score": <0-10>, "feedback": "...", "category": "TECHNICAL"}
  ],
  "overallScore": <0-100>,
  "summary": "Overall assessment paragraph"
}
Score each answer 0-10. Overall score 0-100.
Return ONLY valid JSON.`;

    const qaPairs = questions.map((q: any, i: number) => ({
        id: q.id,
        question: q.question,
        answer: answers[i]?.answer || 'No answer provided',
        category: q.category,
    }));

    const userPrompt = `Job: ${job.title}
Required Skills: ${job.skills?.join(', ')}

Questions and Answers:
${qaPairs.map((qa: any) => `Q (${qa.category}): ${qa.question}\nA: ${qa.answer}`).join('\n\n')}`;

    const result = await chatCompletion(systemPrompt, userPrompt);

    try {
        return JSON.parse(result);
    } catch {
        return {
            evaluatedQuestions: qaPairs.map((qa: any) => ({
                ...qa,
                score: 5,
                feedback: 'Unable to evaluate automatically.',
            })),
            overallScore: 50,
            summary: 'Automatic evaluation was not available. Please review manually.',
        };
    }
}
