# # ─────────────────────────────────────────────
# # tools/writing_tools.py
# # LangChain Tools used by the Writing Agent
# # ─────────────────────────────────────────────

# import re
# from langchain_core.tools import tool
# from loguru import logger


# @tool
# def count_words(text: str) -> int:
#     """
#     Count words in a piece of writing accurately.
#     Handles punctuation and whitespace correctly.
#     """
#     # Remove extra whitespace, split on spaces
#     words = re.findall(r'\b\w+\b', text)
#     count = len(words)
#     logger.debug(f"Word count: {count}")
#     return count


# @tool
# def check_bullet_points(text: str) -> bool:
#     """
#     Check if the response uses bullet points or note form.
#     Returns True if bullet points ARE found (penalty applies).
#     """
#     bullet_patterns = [
#         r'^\s*[-•*▪▸→]\s+',    # -, •, *, ▪, ▸, →
#         r'^\s*\d+\.\s+',        # 1. 2. 3.
#         r'^\s*[a-zA-Z]\)\s+',   # a) b) c)
#     ]
#     for pattern in bullet_patterns:
#         if re.search(pattern, text, re.MULTILINE):
#             logger.warning("Bullet points detected in response!")
#             return True
#     return False


# @tool
# def check_word_count_sufficient(text: str, minimum: int) -> dict:
#     """
#     Check if word count meets IELTS minimum requirement.
#     minimum: 150 for Task 1, 250 for Task 2.
#     Returns dict with count and whether it passes.
#     """
#     words = re.findall(r'\b\w+\b', text)
#     count = len(words)
#     sufficient = count >= minimum
#     return {
#         "word_count": count,
#         "minimum_required": minimum,
#         "sufficient": sufficient,
#         "deficit": max(0, minimum - count)
#     }


# @tool
# def detect_contractions(text: str) -> list:
#     """
#     Detect informal contractions in Task 2 formal essays.
#     Returns list of contractions found.
#     IELTS formal writing should NOT use contractions.
#     """
#     contraction_patterns = [
#         r"\bdon't\b", r"\bcan't\b", r"\bwon't\b", r"\bisn't\b",
#         r"\baren't\b", r"\bdidn't\b", r"\bdoesn't\b", r"\bwouldn't\b",
#         r"\bcouldn't\b", r"\bshouldn't\b", r"\bit's\b", r"\bthat's\b",
#         r"\bthey're\b", r"\bwe're\b", r"\byou're\b", r"\bI'm\b",
#         r"\bI've\b", r"\bI'll\b", r"\bI'd\b", r"\bwe've\b",
#     ]
#     found = []
#     for pattern in contraction_patterns:
#         matches = re.findall(pattern, text, re.IGNORECASE)
#         found.extend(matches)
#     return list(set(found))


# @tool
# def detect_informal_language(text: str) -> list:
#     """
#     Detect informal/conversational words that should be
#     replaced with academic equivalents in IELTS writing.
#     """
#     informal_map = {
#         r'\bkids\b': 'children/adolescents',
#         r'\bstuff\b': 'factors/aspects/elements',
#         r'\bthings\b': 'factors/aspects/issues',
#         r'\bgood\b': 'beneficial/advantageous/positive',
#         r'\bbad\b': 'detrimental/harmful/negative',
#         r'\bbig\b': 'significant/substantial/considerable',
#         r'\bget\b': 'obtain/acquire/receive',
#         r'\blots of\b': 'numerous/a significant number of',
#         r'\ba lot of\b': 'numerous/a significant number of',
#         r'\bvery\b': 'considerably/substantially/significantly',
#         r'\breally\b': 'considerably/extremely',
#         r'\bnowadays\b': 'in contemporary society/in the modern era',
#         r'\bin today\'s modern world\b': '(clichéd opener — avoid)',
#     }
#     found = []
#     for pattern, suggestion in informal_map.items():
#         if re.search(pattern, text, re.IGNORECASE):
#             match = re.search(pattern, text, re.IGNORECASE)
#             found.append({
#                 "found": match.group(),
#                 "suggestion": suggestion
#             })
#     return found


# @tool
# def calculate_final_band(
#     task_achievement: float,
#     coherence_cohesion: float,
#     lexical_resource: float,
#     grammatical_range: float
# ) -> float:
#     """
#     Calculate final IELTS band score from 4 criteria.
#     Formula: Average of 4 bands, rounded to nearest 0.5
#     """
#     average = (task_achievement + coherence_cohesion +
#                lexical_resource + grammatical_range) / 4

#     # Round to nearest 0.5
#     rounded = round(average * 2) / 2
#     logger.info(f"Band calculation: {task_achievement}+{coherence_cohesion}+"
#                 f"{lexical_resource}+{grammatical_range} = {average:.2f} → {rounded}")
#     return rounded


# @tool
# def calculate_overall_writing_band(task1_band: float, task2_band: float) -> float:
#     """
#     Calculate overall IELTS Writing band.
#     Task 1 = 33% weight, Task 2 = 67% weight (Task 2 worth double).
#     """
#     weighted = (task1_band * 1 + task2_band * 2) / 3
#     rounded = round(weighted * 2) / 2
#     logger.info(f"Overall Writing Band: T1={task1_band}(33%) + "
#                 f"T2={task2_band}(67%) = {weighted:.2f} → {rounded}")
#     return rounded
























# # ─────────────────────────────────────────────
# # tools/writing_tools.py
# # LangChain Tools used by the Writing Agent
# # ─────────────────────────────────────────────

# import re
# from langchain_core.tools import tool
# from loguru import logger


# @tool
# def count_words(text: str) -> int:
#     """
#     Count words in a piece of writing accurately.
#     Handles punctuation and whitespace correctly.
#     """
#     # Remove extra whitespace, split on spaces
#     words = re.findall(r'\b\w+\b', text)
#     count = len(words)
#     logger.debug(f"Word count: {count}")
#     return count


# @tool
# def check_bullet_points(text: str) -> bool:
#     """
#     Check if the response uses bullet points or note form.
#     Returns True if bullet points ARE found (penalty applies).
#     """
#     bullet_patterns = [
#         r'^\s*[-•*▪▸→]\s+',    # -, •, *, ▪, ▸, →
#         r'^\s*\d+\.\s+',        # 1. 2. 3.
#         r'^\s*[a-zA-Z]\)\s+',   # a) b) c)
#     ]
#     for pattern in bullet_patterns:
#         if re.search(pattern, text, re.MULTILINE):
#             logger.warning("Bullet points detected in response!")
#             return True
#     return False


# @tool
# def check_word_count_sufficient(text: str, minimum: int) -> dict:
#     """
#     Check if word count meets IELTS minimum requirement.
#     minimum: 150 for Task 1, 250 for Task 2.
#     Returns dict with count and whether it passes.
#     """
#     words = re.findall(r'\b\w+\b', text)
#     count = len(words)
#     sufficient = count >= minimum
#     return {
#         "word_count": count,
#         "minimum_required": minimum,
#         "sufficient": sufficient,
#         "deficit": max(0, minimum - count)
#     }


# @tool
# def detect_contractions(text: str) -> list:
#     """
#     Detect informal contractions in Task 2 formal essays.
#     Returns list of contractions found.
#     IELTS formal writing should NOT use contractions.
#     """
#     contraction_patterns = [
#         r"\bdon't\b", r"\bcan't\b", r"\bwon't\b", r"\bisn't\b",
#         r"\baren't\b", r"\bdidn't\b", r"\bdoesn't\b", r"\bwouldn't\b",
#         r"\bcouldn't\b", r"\bshouldn't\b", r"\bit's\b", r"\bthat's\b",
#         r"\bthey're\b", r"\bwe're\b", r"\byou're\b", r"\bI'm\b",
#         r"\bI've\b", r"\bI'll\b", r"\bI'd\b", r"\bwe've\b",
#     ]
#     found = []
#     for pattern in contraction_patterns:
#         matches = re.findall(pattern, text, re.IGNORECASE)
#         found.extend(matches)
#     return list(set(found))


# @tool
# def detect_informal_language(text: str) -> list:
#     """
#     Detect informal/conversational words that should be
#     replaced with academic equivalents in IELTS writing.
#     """
#     informal_map = {
#         r'\bkids\b': 'children/adolescents',
#         r'\bstuff\b': 'factors/aspects/elements',
#         r'\bthings\b': 'factors/aspects/issues',
#         r'\bgood\b': 'beneficial/advantageous/positive',
#         r'\bbad\b': 'detrimental/harmful/negative',
#         r'\bbig\b': 'significant/substantial/considerable',
#         r'\bget\b': 'obtain/acquire/receive',
#         r'\blots of\b': 'numerous/a significant number of',
#         r'\ba lot of\b': 'numerous/a significant number of',
#         r'\bvery\b': 'considerably/substantially/significantly',
#         r'\breally\b': 'considerably/extremely',
#         r'\bnowadays\b': 'in contemporary society/in the modern era',
#         r'\bin today\'s modern world\b': '(clichéd opener — avoid)',
#     }
#     found = []
#     for pattern, suggestion in informal_map.items():
#         if re.search(pattern, text, re.IGNORECASE):
#             match = re.search(pattern, text, re.IGNORECASE)
#             found.append({
#                 "found": match.group(),
#                 "suggestion": suggestion
#             })
#     return found


# @tool
# def calculate_final_band(
#     task_achievement: float,
#     coherence_cohesion: float,
#     lexical_resource: float,
#     grammatical_range: float
# ) -> float:
#     """
#     Calculate final IELTS band score from 4 criteria.
#     Formula: Average of 4 bands, rounded to nearest 0.5
#     """
#     average = (task_achievement + coherence_cohesion +
#                lexical_resource + grammatical_range) / 4

#     # Round to nearest 0.5
#     rounded = round(average * 2) / 2
#     logger.info(f"Band calculation: {task_achievement}+{coherence_cohesion}+"
#                 f"{lexical_resource}+{grammatical_range} = {average:.2f} → {rounded}")
#     return rounded


# @tool
# def calculate_overall_writing_band(task1_band: float, task2_band: float) -> float:
#     """
#     Calculate overall IELTS Writing band.
#     Task 1 = 33% weight, Task 2 = 67% weight (Task 2 worth double).
#     """
#     weighted = (task1_band * 1 + task2_band * 2) / 3
#     rounded = round(weighted * 2) / 2
#     logger.info(f"Overall Writing Band: T1={task1_band}(33%) + "
#                 f"T2={task2_band}(67%) = {weighted:.2f} → {rounded}")
#     return rounded


# # ─────────────────────────────────────────────
# # AI-CONTENT DETECTION — deterministic heuristics
# # Classic stylometric signals used as supporting evidence for the
# # LLM's judgment — NOT a standalone verdict. No single heuristic
# # is reliable on its own; they're combined in agents/writing_agent.py.
# # ─────────────────────────────────────────────

# @tool
# def calculate_sentence_burstiness(text: str) -> dict:
#     """
#     Measure sentence-length variance ("burstiness").
#     Human writing tends to mix short and long sentences (high variance).
#     AI-generated text tends to have uniform sentence lengths (low variance).
#     Returns mean length, std deviation, and a normalized burstiness score.
#     """
#     sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
#     if len(sentences) < 3:
#         return {"sentence_count": len(sentences), "mean_length": 0.0,
#                 "std_dev": 0.0, "burstiness_score": 0.0, "note": "too_short_to_measure"}

#     lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
#     mean_len = sum(lengths) / len(lengths)
#     variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
#     std_dev = variance ** 0.5
#     burstiness_score = round(std_dev / mean_len, 3) if mean_len > 0 else 0.0

#     return {
#         "sentence_count": len(sentences),
#         "mean_length": round(mean_len, 1),
#         "std_dev": round(std_dev, 1),
#         "burstiness_score": burstiness_score,
#     }


# @tool
# def calculate_vocabulary_diversity(text: str) -> dict:
#     """
#     Type-Token Ratio (TTR) — ratio of unique words to total words.
#     AI text often shows unnaturally consistent word choice patterns
#     compared to natural human writing.
#     """
#     words = [w.lower() for w in re.findall(r'\b\w+\b', text)]
#     if len(words) < 20:
#         return {"word_count": len(words), "unique_words": 0, "ttr": 0.0, "note": "too_short_to_measure"}

#     unique = set(words)
#     ttr = round(len(unique) / len(words), 3)

#     return {
#         "word_count": len(words),
#         "unique_words": len(unique),
#         "ttr": ttr,
#     }


# @tool
# def detect_repetitive_phrasing(text: str) -> dict:
#     """
#     Detect repeated 4-word sequences (n-grams) and generic AI-style
#     transition phrases (e.g. "In today's fast-paced world", "It is important
#     to note that"). High repetition or heavy use of generic connectors
#     is a common AI-writing signature.
#     """
#     words = re.findall(r'\b\w+\b', text.lower())
#     ngrams = [' '.join(words[i:i + 4]) for i in range(len(words) - 3)]
#     seen: dict = {}
#     for ng in ngrams:
#         seen[ng] = seen.get(ng, 0) + 1
#     repeated = {ng: c for ng, c in seen.items() if c > 1}

#     generic_phrases = [
#         "in today's fast-paced world", "in today's modern world", "in this modern era",
#         "it is important to note", "it is worth noting", "on the other hand",
#         "in conclusion, it can be", "plays a vital role", "plays a significant role",
#         "cannot be overstated", "in the fast-paced world of",
#     ]
#     found_generic = [p for p in generic_phrases if p in text.lower()]

#     return {
#         "repeated_4grams_count": len(repeated),
#         "top_repeated": sorted(repeated.items(), key=lambda x: -x[1])[:5],
#         "generic_ai_phrases_found": found_generic,
#     }























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


# ─────────────────────────────────────────────
# AI-CONTENT DETECTION — deterministic heuristics
# Classic stylometric signals used as supporting evidence for the
# LLM's judgment — NOT a standalone verdict. No single heuristic
# is reliable on its own; they're combined in agents/writing_agent.py.
# ─────────────────────────────────────────────

@tool
def calculate_sentence_burstiness(text: str) -> dict:
    """
    Measure sentence-length variance ("burstiness").
    Human writing tends to mix short and long sentences (high variance).
    AI-generated text tends to have uniform sentence lengths (low variance).
    Returns mean length, std deviation, a normalized burstiness score, and
    an explicit is_low_burstiness flag (score < 0.35 — heuristic threshold,
    not empirically validated against a labeled dataset) so the caller
    doesn't have to guess whether a given score counts as "low".
    """
    sentences = [s.strip() for s in re.split(r'[.!?]+', text) if s.strip()]
    if len(sentences) < 3:
        return {"sentence_count": len(sentences), "mean_length": 0.0,
                "std_dev": 0.0, "burstiness_score": 0.0,
                "is_low_burstiness": False, "note": "too_short_to_measure"}

    lengths = [len(re.findall(r'\b\w+\b', s)) for s in sentences]
    mean_len = sum(lengths) / len(lengths)
    variance = sum((l - mean_len) ** 2 for l in lengths) / len(lengths)
    std_dev = variance ** 0.5
    burstiness_score = round(std_dev / mean_len, 3) if mean_len > 0 else 0.0

    return {
        "sentence_count": len(sentences),
        "mean_length": round(mean_len, 1),
        "std_dev": round(std_dev, 1),
        "burstiness_score": burstiness_score,
        "is_low_burstiness": burstiness_score < 0.35,
    }


@tool
def calculate_vocabulary_diversity(text: str) -> dict:
    """
    Type-Token Ratio (TTR) — ratio of unique words to total words.
    IMPORTANT CAVEAT: raw TTR drops naturally as text gets longer (more
    words = more repetition of common function words), regardless of
    whether the author is human or AI — this is a well-known confound.
    To partially correct for it, the "expected" threshold is scaled by
    word count instead of using one fixed number, and an explicit
    is_low_diversity flag is returned instead of a raw ratio the caller
    would otherwise have to judge without a reference point.
    """
    words = [w.lower() for w in re.findall(r'\b\w+\b', text)]
    if len(words) < 20:
        return {"word_count": len(words), "unique_words": 0, "ttr": 0.0,
                "is_low_diversity": False, "note": "too_short_to_measure"}

    unique = set(words)
    ttr = round(len(unique) / len(words), 3)

    # Length-adjusted threshold — longer texts are expected to have a
    # naturally lower TTR, so the bar for "low" drops as word count rises.
    word_count = len(words)
    if word_count < 150:
        threshold = 0.65
    elif word_count < 300:
        threshold = 0.55
    else:
        threshold = 0.45

    return {
        "word_count": word_count,
        "unique_words": len(unique),
        "ttr": ttr,
        "is_low_diversity": ttr < threshold,
    }


@tool
def detect_repetitive_phrasing(text: str) -> dict:
    """
    Detect repeated 4-word sequences (n-grams) and generic AI-style
    transition/filler phrases. LLMs (ChatGPT/GPT-4-class especially)
    have well-documented characteristic phrases; this list is intentionally
    broad to catch common ones. Also returns a generic_phrase_count and
    has_multiple_generic_phrases flag (2+) since that co-occurrence is a
    strong signal per the detection prompt's calibration rules.
    """
    words = re.findall(r'\b\w+\b', text.lower())
    ngrams = [' '.join(words[i:i + 4]) for i in range(len(words) - 3)]
    seen: dict = {}
    for ng in ngrams:
        seen[ng] = seen.get(ng, 0) + 1
    repeated = {ng: c for ng, c in seen.items() if c > 1}

    generic_phrases = [
        # Classic templated openers/closers
        "in today's fast-paced world", "in today's modern world", "in this modern era",
        "in the modern era", "in an increasingly interconnected world",
        "in an increasingly digital world", "in recent years", "with the advent of",
        "in the age of", "as technology continues to advance", "since the dawn of",
        # Hedge/filler transitions
        "it is important to note", "it is worth noting", "it is crucial to consider",
        "it is essential to understand", "one must consider", "it goes without saying",
        "needless to say", "on the other hand", "in contrast", "conversely",
        "furthermore", "moreover", "additionally", "in addition to this",
        "consequently", "as a result of this", "in light of this",
        # Conclusion clichés
        "in conclusion, it can be", "in conclusion,", "to conclude,", "in summary,",
        "overall, it can be said", "all things considered", "to sum up,",
        # Overused GPT vocabulary/metaphors
        "plays a vital role", "plays a significant role", "plays a crucial role",
        "plays a pivotal role", "cannot be overstated", "cannot be understated",
        "holds significant importance", "holds great importance",
        "in the fast-paced world of", "delve into", "delves into", "navigate",
        "landscape of", "realm of", "in the realm of", "a myriad of", "a plethora of",
        "testament to", "boasts", "underscore", "underscores", "shed light on",
        "sheds light on", "paves the way", "double-edged sword",
        "double edged sword", "a double-edged sword",
    ]
    found_generic = [p for p in generic_phrases if p in text.lower()]

    return {
        "repeated_4grams_count": len(repeated),
        "top_repeated": sorted(repeated.items(), key=lambda x: -x[1])[:5],
        "generic_ai_phrases_found": found_generic,
        "generic_phrase_count": len(found_generic),
        "has_multiple_generic_phrases": len(found_generic) >= 2,
    }


