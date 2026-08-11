import io
import json
import re
import asyncio
import random
import edge_tts
import cloudinary
import cloudinary.uploader
from typing import List, Dict, Any, Tuple
from loguru import logger
from langchain_groq import ChatGroq
from core.config import settings
from schemas.listening_schema import (
    ListeningTestGenerateResponse,
    ListeningSectionSchema,
    ListeningQuestionSchema,
    ListeningSubmitRequest,
    ListeningSubmitResponse,
    QuestionResultSchema,
    SectionScoreSchema,
    QuestionTypeScoreSchema
)
from prompts.listening_prompts import TOPIC_POOL, SECTION_PROMPT_TEMPLATE

class ListeningTestGeneratorAgent:
    def __init__(self):
        self.llm = ChatGroq(
            temperature=0.7,
            groq_api_key=settings.GROQ_API_KEY,
            model=settings.LLM_MODEL,
            max_tokens=min(getattr(settings, 'LLM_LISTENING_MAX_TOKENS', 1950), 1950)
        )

    async def _generate_audio_for_transcript(self, transcript: str, section_index: int) -> str:
        try:
            available_voices = [
                "en-GB-SoniaNeural",     # Female British
                "en-GB-RyanNeural",      # Male British
                "en-AU-NatashaNeural",   # Female Australian
                "en-AU-WilliamNeural",   # Male Australian
                "en-US-JennyNeural",     # Female US
                "en-US-GuyNeural"        # Male US
            ]

            speaker_map: Dict[str, str] = {}
            assigned_count = 0
            mp3_buffer = io.BytesIO()

            lines = [l.strip() for l in transcript.splitlines() if l.strip()]
            for line in lines:
                match = re.match(r'^([A-Za-z0-9\s_-]+):\s*(.*)', line)
                if match:
                    speaker = match.group(1).strip()
                    text = match.group(2).strip()
                    if not text:
                        continue

                    if speaker not in speaker_map:
                        speaker_map[speaker] = available_voices[assigned_count % len(available_voices)]
                        assigned_count += 1

                    voice = speaker_map[speaker]
                else:
                    text = line
                    voice = available_voices[section_index % len(available_voices)]

                communicate = edge_tts.Communicate(text, voice)
                async for chunk in communicate.stream():
                    if chunk["type"] == "audio":
                        mp3_buffer.write(chunk["data"])

            mp3_bytes = mp3_buffer.getvalue()
            if not mp3_bytes:
                return ""

            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )
            res = cloudinary.uploader.upload(
                mp3_bytes,
                resource_type="video",
                folder="ielts_listening_audio"
            )
            return res.get("secure_url", "")
        except Exception as e:
            logger.error(f"Failed to generate multi-speaker TTS audio for section {section_index}: {e}")
            return ""

    async def _generate_section(self, section_index: int, start_q: int, num_q: int, delay: int) -> Tuple[Dict, List[Dict]]:
        if delay > 0:
            await asyncio.sleep(delay)
            
        part_key = f"Part {section_index + 1}"
        topic = random.choice(TOPIC_POOL[part_key])
        
        difficulty_map = {0: "easy", 1: "moderate", 2: "moderate-hard", 3: "hard"}
        difficulty = difficulty_map[section_index]
        
        speaker_configs = {
            0: (2, "Receptionist, Customer"),
            1: (1, "Guide/Announcer"),
            2: (3, "Tutor, Student 1, Student 2"),
            3: (1, "Lecturer")
        }
        num_speakers, speaker_names = speaker_configs[section_index]
        
        q_types_map = {
            0: ["short_answer", "sentence_completion"],
            1: ["mcq", "matching"],
            2: ["mcq", "matching", "sentence_completion"],
            3: ["sentence_completion", "mcq"]
        }
        q_types = q_types_map[section_index]
        end_q = start_q + num_q - 1
        
        prompt = SECTION_PROMPT_TEMPLATE.format(
            section_num=section_index + 1,
            section_index=section_index,
            difficulty=difficulty,
            context=topic,
            num_speakers=num_speakers,
            speaker_names=speaker_names,
            start_q=start_q,
            end_q=end_q,
            num_questions=num_q,
            q_types=", ".join(q_types)
        )

        for attempt in range(4):
            try:
                response = await self.llm.ainvoke(prompt)
                content = response.content
                
                start_idx = content.find('{')
                end_idx = content.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    json_str = content[start_idx:end_idx+1]
                    data = json.loads(json_str)
                    
                    audio_url = await self._generate_audio_for_transcript(data["transcript"], section_index)

                    section_info = {
                        "index": section_index,
                        "title": f"Section {section_index + 1}: {topic}",
                        "description": f"Listening part {section_index + 1} about {topic}",
                        "difficulty": difficulty,
                        "speakers": num_speakers,
                        "speakerNames": [s.strip() for s in speaker_names.split(',')],
                        "durationMinutes": 7.0,
                        "questionRange": [start_q, end_q],
                        "transcript": data["transcript"],
                        "audioUrl": audio_url
                    }
                    
                    return section_info, data["questions"]
            except Exception as e:
                logger.error(f"Attempt {attempt+1} failed for section {section_index}: {e}")
                if attempt < 3:
                    await asyncio.sleep((attempt + 1) * 4)
                
        raise Exception(f"Failed to generate section {section_index} after 4 attempts")

    async def generate_test(self) -> ListeningTestGenerateResponse:
        tasks = [
            self._generate_section(0, 1, 10, 0),
            self._generate_section(1, 11, 10, 3),
            self._generate_section(2, 21, 10, 6),
            self._generate_section(3, 31, 10, 9)
        ]
        
        results = await asyncio.gather(*tasks)
        
        sections = []
        questions = []
        audioUrls = {}
        transcripts = {}
        topics = []
        
        for idx, (sec_info, sec_qs) in enumerate(results):
            sections.append(ListeningSectionSchema(**sec_info))
            topics.append(sec_info["title"])
            transcripts[str(idx)] = sec_info["transcript"]
            audioUrls[str(idx)] = sec_info["audioUrl"]
            
            for q in sec_qs:
                if "correctAnswer" in q:
                    q["correctAnswer"] = str(q["correctAnswer"])
                if "options" in q and isinstance(q["options"], list):
                    q["options"] = [str(opt) for opt in q["options"]]
                questions.append(ListeningQuestionSchema(**q))
                
        return ListeningTestGenerateResponse(
            title="IELTS Practice Listening Test",
            difficulty="mixed",
            sections=sections,
            questions=questions,
            audioUrls=audioUrls,
            transcripts=transcripts,
            topics=topics,
            totalQuestions=40
        )

class ListeningScorer:
    @staticmethod
    def is_answer_correct(q_type: str, user_ans: str, correct_ans: str) -> bool:
        if not user_ans:
            return False
            
        user_ans = str(user_ans).strip().lower()
        correct_ans = str(correct_ans).strip().lower()
        
        if q_type == "mcq":
            user_match = re.search(r"\b([a-d])\b", user_ans)
            correct_match = re.search(r"\b([a-d])\b", correct_ans)
            
            user_letter = user_match.group(1) if user_match else user_ans[:1]
            correct_letter = correct_match.group(1) if correct_match else correct_ans[:1]
            return user_letter == correct_letter
            
        elif q_type == "matching":
            return user_ans == correct_ans
            
        elif q_type in ["sentence_completion", "short_answer"]:
            user_clean = re.sub(r'[^\w\s]', '', user_ans)
            correct_clean = re.sub(r'[^\w\s]', '', correct_ans)
            return user_clean in correct_clean or correct_clean in user_clean
            
        return user_ans == correct_ans

    @staticmethod
    def evaluate(payload: ListeningSubmitRequest) -> ListeningSubmitResponse:
        score = 0
        section_correct = {0: 0, 1: 0, 2: 0, 3: 0}
        type_correct = {}
        type_total = {}
        results = []
        
        questions_dict = {str(q.index): q for q in payload.test.questions}
        
        for q_idx in range(1, 41):
            q_str = str(q_idx)
            if q_str not in questions_dict:
                continue
                
            q = questions_dict[q_str]
            user_ans = payload.answers.get(q_str, "")
            is_correct = ListeningScorer.is_answer_correct(q.type, user_ans, q.correctAnswer)
            
            if is_correct:
                score += 1
                section_correct[q.sectionIndex] += 1
                type_correct[q.type] = type_correct.get(q.type, 0) + 1
                
            type_total[q.type] = type_total.get(q.type, 0) + 1
            
            results.append(QuestionResultSchema(
                index=q.index,
                sectionIndex=q.sectionIndex,
                type=q.type,
                text=q.text,
                userAnswer=user_ans,
                correctAnswer=q.correctAnswer,
                isCorrect=is_correct,
                explanation=q.explanation
            ))
            
        band_table = [
            (39, 9.0), (37, 8.5), (35, 8.0), (33, 7.5), (30, 7.0),
            (27, 6.5), (23, 6.0), (20, 5.5), (16, 5.0), (13, 4.5),
            (10, 4.0), (6, 3.5), (4, 3.0), (3, 2.5), (2, 2.0),
            (1, 1.5), (0, 1.0)
        ]
        
        band_score = 1.0
        for threshold, band in band_table:
            if score >= threshold:
                band_score = band
                break
                
        section_scores = []
        diff_map = {0: "easy", 1: "moderate", 2: "moderate-hard", 3: "hard"}
        for i in range(4):
            section_scores.append(SectionScoreSchema(
                sectionIndex=i,
                correct=section_correct[i],
                total=10,
                difficulty=diff_map[i]
            ))
            
        type_scores = []
        for t, total in type_total.items():
            type_scores.append(QuestionTypeScoreSchema(
                type=t,
                label=t.replace('_', ' ').title(),
                correct=type_correct.get(t, 0),
                total=total
            ))
            
        weakest = min(type_scores, key=lambda x: x.correct/x.total if x.total > 0 else 1, default=None)
        recs = []
        if weakest and weakest.correct/weakest.total < 0.7:
            recs.append(f"Focus on improving {weakest.label} questions.")
        if score < 25:
            recs.append("Practice listening to different accents (British, Australian, American).")
            
        return ListeningSubmitResponse(
            score=score,
            bandScore=band_score,
            accuracy=(score / 40.0) * 100,
            timeTakenSeconds=payload.timeTakenSeconds,
            sectionScores=section_scores,
            questionTypeScores=type_scores,
            questionResults=results,
            recommendations=recs
        )
