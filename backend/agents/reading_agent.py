# backend/agents/reading_agent.py — IELTS Reading Test Generator & Scorer

import json
import random
import re
import asyncio
from typing import Dict, Any, List, Tuple
from loguru import logger
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage

from core.config import settings
from schemas.reading_schema import (
    ReadingTestGenerateResponse,
    ReadingSubmitRequest,
    ReadingSubmitResponse,
    PassageScoreSchema,
    QuestionTypeScoreSchema,
    QuestionResultSchema,
)
from prompts.reading_prompts import TOPIC_POOL, PASSAGE_PROMPT_TEMPLATE


# ── IELTS Reading Band Conversion Table ─────────────────────────────────────
# Standard IELTS Academic Reading Raw-to-Band Mapping
BAND_CONVERSION_TABLE = [
    (39, 9.0),
    (37, 8.5),
    (35, 8.0),
    (33, 7.5),
    (30, 7.0),
    (27, 6.5),
    (23, 6.0),
    (19, 5.5),
    (15, 5.0),
    (13, 4.5),
    (10, 4.0),
    (6, 3.5),
    (4, 3.0),
    (0, 2.5),
]


def raw_score_to_band(score: int) -> float:
    for raw_min, band in BAND_CONVERSION_TABLE:
        if score >= raw_min:
            return band
    return 2.5


from core.dynamic_settings import get_chat_groq

class ReadingTestGeneratorAgent:
    def __init__(self):
        self.llm = get_chat_groq(max_tokens=8192, temperature=0.3)


    def _sanitize_json(self, raw_text: str) -> str:
        """Removes Markdown code block wrappers and trims trailing whitespace."""
        text = raw_text.strip()
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*", "", text)
            text = re.sub(r"\s*```$", "", text)
        return text.strip()

    async def _generate_passage(
        self,
        passage_num: int,
        difficulty: str,
        topic: str,
        start_q: int,
        end_q: int,
        num_questions: int,
        min_words: int,
        max_words: int,
        num_paragraphs: int,
        q_types: Tuple[Tuple[str, str, str], Tuple[str, str, str], Tuple[str, str, str]],
    ) -> Dict[str, Any]:
        passage_index = passage_num - 1
        (qt1_type, qt1_range, _), (qt2_type, qt2_range, _), (qt3_type, qt3_range, _) = q_types

        prompt = PASSAGE_PROMPT_TEMPLATE.format(
            passage_num=passage_num,
            passage_index=passage_index,
            difficulty=difficulty,
            topic=topic,
            start_q=start_q,
            end_q=end_q,
            num_questions=num_questions,
            min_words=min_words,
            max_words=max_words,
            num_paragraphs=num_paragraphs,
            q_type1=qt1_type,
            q_type1_range=qt1_range,
            q_type2=qt2_type,
            q_type2_range=qt2_range,
            q_type3=qt3_type,
            q_type3_range=qt3_range,
        )

        messages = [
            SystemMessage(content="You are an official Cambridge IELTS Academic Reading test item writer."),
            HumanMessage(content=prompt),
        ]

        logger.info(f"Generating Passage {passage_num} ({difficulty}) on topic '{topic}'...")

        for attempt in range(3):
            try:
                response = await self.llm.ainvoke(messages)
                clean_json = self._sanitize_json(response.content)
                data = json.loads(clean_json)

                # Validate expected keys
                if "paragraphs" in data and "questions" in data:
                    return data
            except Exception as e:
                logger.warning(f"Passage {passage_num} generation attempt {attempt + 1} failed: {e}")
                await asyncio.sleep(2 ** attempt)

        raise RuntimeError(f"Failed to generate Passage {passage_num} after 3 attempts")

    async def generate_test(self) -> Dict[str, Any]:
        """Generates a complete 3-passage, 40-question IELTS Reading Test."""
        selected_topics = random.sample(TOPIC_POOL, 3)

        # Passage configs
        configs = [
            {
                "passage_num": 1,
                "difficulty": "easy",
                "topic": selected_topics[0],
                "start_q": 1,
                "end_q": 13,
                "num_questions": 13,
                "min_words": 600,
                "max_words": 750,
                "num_paragraphs": 4,
                "q_types": (
                    ("mcq", "1-4", "Multiple Choice"),
                    ("true_false_not_given", "5-8", "True/False/Not Given"),
                    ("sentence_completion", "9-13", "Sentence Completion"),
                ),
            },
            {
                "passage_num": 2,
                "difficulty": "moderate",
                "topic": selected_topics[1],
                "start_q": 14,
                "end_q": 27,
                "num_questions": 14,
                "min_words": 800,
                "max_words": 950,
                "num_paragraphs": 5,
                "q_types": (
                    ("mcq", "14-17", "Multiple Choice"),
                    ("matching_headings", "18-22", "Matching Headings"),
                    ("short_answer", "23-27", "Short Answer"),
                ),
            },
            {
                "passage_num": 3,
                "difficulty": "hard",
                "topic": selected_topics[2],
                "start_q": 28,
                "end_q": 40,
                "num_questions": 13,
                "min_words": 950,
                "max_words": 1150,
                "num_paragraphs": 6,
                "q_types": (
                    ("true_false_not_given", "28-32", "True/False/Not Given"),
                    ("sentence_completion", "33-36", "Sentence Completion"),
                    ("mcq", "37-40", "Multiple Choice"),
                ),
            },
        ]

        # Generate 3 passages concurrently using asyncio.gather
        tasks = [self._generate_passage(**cfg) for cfg in configs]
        passages_data = await asyncio.gather(*tasks)

        # Assemble full test
        all_passages = []
        all_questions = []

        for pdata in passages_data:
            all_passages.append({
                "index": pdata.get("index", 0),
                "title": pdata.get("title", "Reading Passage"),
                "difficulty": pdata.get("difficulty", "moderate"),
                "topic": pdata.get("topic", "General Academic"),
                "paragraphs": pdata.get("paragraphs", []),
                "questionRange": pdata.get("questionRange", [1, 13]),
            })
            for q in pdata.get("questions", []):
                all_questions.append({
                    "index": q.get("index"),
                    "passageIndex": q.get("passageIndex", 0),
                    "type": q.get("type", "mcq"),
                    "text": q.get("text", ""),
                    "options": q.get("options"),
                    "correctAnswer": str(q.get("correctAnswer", "")).strip(),
                    "explanation": q.get("explanation"),
                    "paragraphRef": q.get("paragraphRef"),
                })

        # Ensure sorted by question index
        all_questions.sort(key=lambda x: x["index"])

        return {
            "title": f"IELTS Academic Reading Test: {selected_topics[0].split()[0]} & More",
            "difficulty": "mixed",
            "passages": all_passages,
            "questions": all_questions,
            "topics": selected_topics,
            "totalQuestions": len(all_questions),
        }


class ReadingScorer:
    """Deterministic evaluator for IELTS Reading objective answers."""

    @staticmethod
    def _clean_str(val: str) -> str:
        return re.sub(r"\s+", " ", val.strip().lower())

    @classmethod
    def is_answer_correct(cls, q_type: str, user_ans: str, correct_ans: str) -> bool:
        if not user_ans or not user_ans.strip():
            return False

        u = cls._clean_str(user_ans).rstrip(".,;")
        c = cls._clean_str(correct_ans).rstrip(".,;")

        if q_type == "mcq":
            # Match single option letter e.g. "a" from "a. option text" or "a"
            u_match = re.search(r"\b([a-d])\b", u)
            c_match = re.search(r"\b([a-d])\b", c)
            u_letter = u_match.group(1) if u_match else u[0] if u else ""
            c_letter = c_match.group(1) if c_match else c[0] if c else ""
            return u_letter == c_letter

        if q_type == "true_false_not_given":
            norm_map = {
                "t": "true", "true": "true",
                "f": "false", "false": "false",
                "ng": "not given", "not given": "not given", "notgiven": "not given"
            }
            u_norm = norm_map.get(u, u)
            c_norm = norm_map.get(c, c)
            return u_norm == c_norm

        if q_type in ("sentence_completion", "short_answer"):
            # Substring or exact match ignoring trailing punctuation
            return u == c or u in c or c in u

        if q_type == "matching_headings":
            # Match paragraph letter e.g. "B" or "Paragraph B"
            u_match = re.search(r"\b([a-z])\b", u)
            c_match = re.search(r"\b([a-z])\b", c)
            u_letter = u_match.group(1) if u_match else u[0] if u else ""
            c_letter = c_match.group(1) if c_match else c[0] if c else ""
            return u_letter == c_letter

        return u == c

    @classmethod
    def evaluate(cls, payload: ReadingSubmitRequest) -> ReadingSubmitResponse:
        test = payload.test
        answers = payload.answers or payload.userAnswers or {}  # Dict[str, str] keyed by question index str e.g. "1"

        question_results: List[QuestionResultSchema] = []
        raw_score = 0

        # Per passage stats
        passage_totals = {0: {"correct": 0, "total": 0, "difficulty": "easy"},
                          1: {"correct": 0, "total": 0, "difficulty": "moderate"},
                          2: {"correct": 0, "total": 0, "difficulty": "hard"}}

        # Question type stats
        type_labels = {
            "mcq": "Multiple Choice",
            "true_false_not_given": "True / False / Not Given",
            "matching_headings": "Matching Headings",
            "sentence_completion": "Sentence Completion",
            "short_answer": "Short Answer",
        }
        type_totals: Dict[str, Dict[str, int]] = {}

        for q in test.questions:
            q_idx_str = str(q.index)
            user_ans = answers.get(q_idx_str, "").strip()
            correct_ans = str(q.correctAnswer).strip()

            is_correct = cls.is_answer_correct(q.type, user_ans, correct_ans)
            if is_correct:
                raw_score += 1

            p_idx = q.passageIndex
            if p_idx in passage_totals:
                passage_totals[p_idx]["total"] += 1
                if is_correct:
                    passage_totals[p_idx]["correct"] += 1

            q_type = q.type
            if q_type not in type_totals:
                type_totals[q_type] = {"correct": 0, "total": 0}
            type_totals[q_type]["total"] += 1
            if is_correct:
                type_totals[q_type]["correct"] += 1

            question_results.append(
                QuestionResultSchema(
                    index=q.index,
                    passageIndex=q.passageIndex,
                    type=q.type,
                    text=q.text,
                    userAnswer=user_ans,
                    correctAnswer=correct_ans,
                    isCorrect=is_correct,
                    explanation=q.explanation,
                    paragraphRef=q.paragraphRef,
                )
            )

        band_score = raw_score_to_band(raw_score)
        total_questions = len(test.questions) or 40
        accuracy = round((raw_score / total_questions) * 100, 1)

        # Build passage scores list
        passage_scores: List[PassageScoreSchema] = []
        for p_idx in range(len(test.passages)):
            p_info = passage_totals.get(p_idx, {"correct": 0, "total": 0, "difficulty": "moderate"})
            p_tot = p_info["total"] or 1
            passage_scores.append(
                PassageScoreSchema(
                    passageIndex=p_idx,
                    difficulty=test.passages[p_idx].difficulty if p_idx < len(test.passages) else "moderate",
                    correct=p_info["correct"],
                    total=p_info["total"],
                    percentage=round((p_info["correct"] / p_tot) * 100, 1),
                )
            )

        # Build question type scores list
        type_scores: List[QuestionTypeScoreSchema] = []
        for q_type, counts in type_totals.items():
            tot = counts["total"] or 1
            type_scores.append(
                QuestionTypeScoreSchema(
                    type=q_type,
                    label=type_labels.get(q_type, q_type.replace("_", " ").title()),
                    correct=counts["correct"],
                    total=counts["total"],
                    percentage=round((counts["correct"] / tot) * 100, 1),
                )
            )

        # Recommendations engine
        recommendations = []
        # Find lowest scoring question type
        if type_scores:
            lowest_type = min(type_scores, key=lambda x: x.percentage)
            if lowest_type.percentage < 60:
                recommendations.append(f"Improve {lowest_type.label} questions ({lowest_type.percentage:.0f}% accuracy)")

        # Find lowest scoring passage
        if passage_scores:
            lowest_p = min(passage_scores, key=lambda x: x.percentage)
            if lowest_p.percentage < 60:
                recommendations.append(
                    f"Focus on Passage {lowest_p.passageIndex + 1} ({lowest_p.difficulty.title()}) — scored {lowest_p.percentage:.0f}%"
                )

        recommendations.append("Practice skimming and scanning techniques for faster comprehension")
        if payload.timeTakenSeconds > 3300:
            recommendations.append("Manage time carefully — aim for 17m on P1, 20m on P2, and 23m on P3")

        return ReadingSubmitResponse(
            score=raw_score,
            bandScore=band_score,
            accuracy=accuracy,
            timeTakenSeconds=payload.timeTakenSeconds,
            passageScores=passage_scores,
            questionTypeScores=type_scores,
            questionResults=question_results,
            recommendations=recommendations,
        )
