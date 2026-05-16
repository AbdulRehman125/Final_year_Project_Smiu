# ─────────────────────────────────────────────
# tools/writing_tools.py
# LangChain Tools used by the Writing Agent
# ─────────────────────────────────────────────

import re
from langchain_core.tools import tool
from loguru import logger


@tool
def count_words(text: str) -> int:
    """
    Count words in a piece of writing accurately.
    Handles punctuation and whitespace correctly.
    """
    # Remove extra whitespace, split on spaces
    words = re.findall(r'\b\w+\b', text)
    count = len(words)
    logger.debug(f"Word count: {count}")
    return count


@tool
def check_bullet_points(text: str) -> bool:
    """
    Check if the response uses bullet points or note form.
    Returns True if bullet points ARE found (penalty applies).
    """
    bullet_patterns = [
        r'^\s*[-•*▪▸→]\s+',    # -, •, *, ▪, ▸, →
        r'^\s*\d+\.\s+',        # 1. 2. 3.
        r'^\s*[a-zA-Z]\)\s+',   # a) b) c)
    ]
    for pattern in bullet_patterns:
        if re.search(pattern, text, re.MULTILINE):
            logger.warning("Bullet points detected in response!")
            return True
    return False


@tool
def check_word_count_sufficient(text: str, minimum: int) -> dict:
    """
    Check if word count meets IELTS minimum requirement.
    minimum: 150 for Task 1, 250 for Task 2.
    Returns dict with count and whether it passes.
    """
    words = re.findall(r'\b\w+\b', text)
    count = len(words)
    sufficient = count >= minimum
    return {
        "word_count": count,
        "minimum_required": minimum,
        "sufficient": sufficient,
        "deficit": max(0, minimum - count)
    }


@tool
def detect_contractions(text: str) -> list:
    """
    Detect informal contractions in Task 2 formal essays.
    Returns list of contractions found.
    IELTS formal writing should NOT use contractions.
    """
    contraction_patterns = [
        r"\bdon't\b", r"\bcan't\b", r"\bwon't\b", r"\bisn't\b",
        r"\baren't\b", r"\bdidn't\b", r"\bdoesn't\b", r"\bwouldn't\b",
        r"\bcouldn't\b", r"\bshouldn't\b", r"\bit's\b", r"\bthat's\b",
        r"\bthey're\b", r"\bwe're\b", r"\byou're\b", r"\bI'm\b",
        r"\bI've\b", r"\bI'll\b", r"\bI'd\b", r"\bwe've\b",
    ]
    found = []
    for pattern in contraction_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        found.extend(matches)
    return list(set(found))


@tool
def detect_informal_language(text: str) -> list:
    """
    Detect informal/conversational words that should be
    replaced with academic equivalents in IELTS writing.
    """
    informal_map = {
        r'\bkids\b': 'children/adolescents',
        r'\bstuff\b': 'factors/aspects/elements',
        r'\bthings\b': 'factors/aspects/issues',
        r'\bgood\b': 'beneficial/advantageous/positive',
        r'\bbad\b': 'detrimental/harmful/negative',
        r'\bbig\b': 'significant/substantial/considerable',
        r'\bget\b': 'obtain/acquire/receive',
        r'\blots of\b': 'numerous/a significant number of',
        r'\ba lot of\b': 'numerous/a significant number of',
        r'\bvery\b': 'considerably/substantially/significantly',
        r'\breally\b': 'considerably/extremely',
        r'\bnowadays\b': 'in contemporary society/in the modern era',
        r'\bin today\'s modern world\b': '(clichéd opener — avoid)',
    }
    found = []
    for pattern, suggestion in informal_map.items():
        if re.search(pattern, text, re.IGNORECASE):
            match = re.search(pattern, text, re.IGNORECASE)
            found.append({
                "found": match.group(),
                "suggestion": suggestion
            })
    return found


@tool
def calculate_final_band(
    task_achievement: float,
    coherence_cohesion: float,
    lexical_resource: float,
    grammatical_range: float
) -> float:
    """
    Calculate final IELTS band score from 4 criteria.
    Formula: Average of 4 bands, rounded to nearest 0.5
    """
    average = (task_achievement + coherence_cohesion +
               lexical_resource + grammatical_range) / 4

    # Round to nearest 0.5
    rounded = round(average * 2) / 2
    logger.info(f"Band calculation: {task_achievement}+{coherence_cohesion}+"
                f"{lexical_resource}+{grammatical_range} = {average:.2f} → {rounded}")
    return rounded


@tool
def calculate_overall_writing_band(task1_band: float, task2_band: float) -> float:
    """
    Calculate overall IELTS Writing band.
    Task 1 = 33% weight, Task 2 = 67% weight (Task 2 worth double).
    """
    weighted = (task1_band * 1 + task2_band * 2) / 3
    rounded = round(weighted * 2) / 2
    logger.info(f"Overall Writing Band: T1={task1_band}(33%) + "
                f"T2={task2_band}(67%) = {weighted:.2f} → {rounded}")
    return rounded
