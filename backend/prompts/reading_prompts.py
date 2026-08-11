# backend/prompts/reading_prompts.py — IELTS Reading LLM Generation Prompts

TOPIC_POOL = [
    "Artificial Intelligence in Healthcare",
    "Urban Biodiversity and Green Architecture",
    "The History and Evolution of Written Language",
    "Deep-Sea Exploration and Hydrothermal Vents",
    "Renewable Energy Transition in Remote Communities",
    "Cognitive Benefits of Multilingualism",
    "Ancient Agricultural Practices of South America",
    "The Physics of Glacier Dynamics",
    "Psychology of Consumer Decision Making",
    "Microplastics and Marine Ecosystems",
    "Space Archaeology and Satellite Remote Sensing",
    "The Revival of Indigenous Languages",
    "Bio-inspired Engineering and Biomimicry",
    "Economic Impact of Global Tourism",
    "The Evolution of Human Sleep Patterns",
    "Restoration of Coastal Wetlands",
    "History of Navigation and Cartography",
    "The Science of Taste and Smell Perception",
]

PASSAGE_PROMPT_TEMPLATE = """You are an expert IELTS Academic Reading test writer with 15+ years of experience crafting official Cambridge IELTS examination papers.

Generate Passage {passage_num} ({difficulty} difficulty) and its corresponding questions for an official IELTS Academic Reading test.

TOPIC: {topic}
DIFFICULTY: {difficulty} (Passage {passage_num} of 3)
QUESTION RANGE: Questions {start_q} to {end_q} (Total: {num_questions} questions)

STRICT REQUIREMENTS FOR THE PASSAGE:
1. Length: {min_words}-{max_words} words.
2. Structure: Divide into exactly {num_paragraphs} labeled paragraphs ("A", "B", "C", "D", "E", "F" where applicable).
3. Tone: Formal, academic, informative style reminiscent of articles in magazines, newspapers, or research publications (e.g. New Scientist, Economist, National Geographic).
4. Content: Rich with facts, historical context, scientific mechanisms, or analytical discussions.

STRICT REQUIREMENTS FOR QUESTIONS ({start_q} to {end_q}):
Generate exactly {num_questions} questions using these specific question types:
- Questions {q_type1_range}: Type "{q_type1}"
- Questions {q_type2_range}: Type "{q_type2}"
- Questions {q_type3_range}: Type "{q_type3}"

RULES FOR QUESTION TYPES:
- "mcq": Must provide 4 options labeled "A", "B", "C", "D". `correctAnswer` must be the option letter e.g. "A".
- "true_false_not_given": Answers MUST be strictly "TRUE", "FALSE", or "NOT GIVEN".
- "sentence_completion": Fill-in-the-blank with 1 to 3 words directly from the text. `correctAnswer` must be the exact word(s).
- "short_answer": Direct question answered in 1 to 3 words from the text. `correctAnswer` must be the exact word(s).
- "matching_headings": Match a paragraph label (A, B, C, D...) to a heading. `text` is the heading statement, `correctAnswer` is the paragraph letter e.g. "B".

OUTPUT FORMAT:
Return ONLY valid JSON matching this exact structure (no Markdown code block wrappers, no preambles):

{{
  "index": {passage_index},
  "title": "A Compelling Title for the Passage",
  "difficulty": "{difficulty}",
  "topic": "{topic}",
  "questionRange": [{start_q}, {end_q}],
  "paragraphs": [
    {{"label": "A", "text": "Paragraph A text here..."}},
    {{"label": "B", "text": "Paragraph B text here..."}}
  ],
  "questions": [
    {{
      "index": {start_q},
      "passageIndex": {passage_index},
      "type": "{q_type1}",
      "text": "Question stem here...",
      "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
      "correctAnswer": "A",
      "explanation": "Brief explanation referencing paragraph A...",
      "paragraphRef": "A"
    }}
  ]
}}
"""
