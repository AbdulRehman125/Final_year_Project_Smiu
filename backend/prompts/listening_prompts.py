import json

TOPIC_POOL = {
    "Part 1": [
        "Booking accommodation", "Renting a house", "Joining a sports club", 
        "Making a restaurant reservation", "Asking about a course", 
        "Enquiring about bus service", "Registering at a library", 
        "Booking a holiday", "Joining a gym membership", "Opening a bank account"
    ],
    "Part 2": [
        "Museum tour guide", "Community centre facilities", "Local park description", 
        "Shopping centre opening", "University campus tour", "City bus tour", 
        "Festival event description", "Airport facilities guide", 
        "Health clinic services", "Library orientation"
    ],
    "Part 3": [
        "University research project", "Assignment discussion with tutor", 
        "Lab experiment planning", "Presentation preparation", 
        "Study group discussion", "Thesis methodology debate", 
        "Field trip planning", "Internship selection discussion", 
        "Course module evaluation", "Group project coordination"
    ],
    "Part 4": [
        "Renewable energy lecture", "Psychology of memory", "Marine biology", 
        "History of architecture", "Climate change impacts", 
        "Artificial intelligence ethics", "Ancient civilizations", 
        "Urban planning development", "Nutrition science", "Space exploration history"
    ]
}

SECTION_PROMPT_TEMPLATE = """
You are an expert IELTS Listening test creator. 
Generate Section {section_num} of a Listening test.

Details:
- Section Index: {section_index}
- Difficulty: {difficulty}
- Context/Topic: {context}
- Number of Speakers: {num_speakers} ({speaker_names})
- Questions: {start_q} to {end_q} (Total: {num_questions})
- Question Types to include: {q_types}

Requirements:
1. Transcript must be a natural, realistic conversation/monologue matching the context.
2. The transcript must be labeled with speaker names if there are multiple speakers.
3. Questions must be answerable ONLY from the transcript.
4. For sentence completion, use __________ to indicate the blank.
5. For short answer, answers should be factual (names, numbers, dates, places).
6. For MCQ, provide exactly 3 options (A, B, C).
7. For matching questions, each question text MUST explicitly specify the item or person being matched (e.g. "Jack — What phase is Jack working on?"). Never output a generic heading as the question text.
8. correctAnswer must be exact text that answers the question.
9. Each question needs an explanation referencing the transcript.

Return ONLY a valid JSON object with the following structure:
{{
    "transcript": "Speaker 1: ...\\nSpeaker 2: ...",
    "questions": [
        {{
            "index": {start_q},
            "sectionIndex": {section_index},
            "type": "mcq",
            "text": "Question text here?",
            "options": ["A. ...", "B. ...", "C. ..."],
            "matchingPairs": null,
            "correctAnswer": "A",
            "explanation": "Explanation here."
        }}
    ]
}}
"""
