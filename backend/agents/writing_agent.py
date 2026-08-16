# # agents/writing_agent.py
# # LangChain Agent — IELTS Writing Evaluator (Groq)

# import json
# import re
# from loguru import logger

# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, SystemMessage

# from core.config import settings
# from prompts.writing_prompts import (
#     TASK1_ACADEMIC_SYSTEM_PROMPT,
#     TASK1_GENERAL_SYSTEM_PROMPT,
#     TASK2_SYSTEM_PROMPT,
# )
# from tools.writing_tools import (
#     check_bullet_points,
#     check_word_count_sufficient,
#     detect_contractions,
#     detect_informal_language,
#     calculate_final_band,
#     calculate_overall_writing_band,
# )
# from schemas.writing_schema import (
#     WritingEvaluationRequest,
#     WritingEvaluationResponse,
#     TaskScore,
#     WritingError,
#     TestType,
# )


# class WritingEvaluationAgent:
#     """
#     IELTS Writing Evaluation Agent.
#     Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.
#     """

#     def __init__(self):
#         self.llm = ChatGroq(
#             model=settings.LLM_MODEL,
#             groq_api_key=settings.GROQ_API_KEY,
#             max_tokens=settings.LLM_MAX_TOKENS,
#             temperature=settings.LLM_TEMPERATURE,
#         )
#         logger.info(f"WritingEvaluationAgent initialized — Model: {settings.LLM_MODEL}")

#     async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
#         logger.info(f"Starting evaluation — Type: {request.test_type}")

#         task1_score = await self._evaluate_task1(
#             response_text=request.task1_response,
#             question=request.task1_question,
#             test_type=request.test_type,
#         )

#         task2_score = await self._evaluate_task2(
#             response_text=request.task2_response,
#             question=request.task2_question,
#         )

#         overall_band = calculate_overall_writing_band.invoke({
#             "task1_band": task1_score.overall_band,
#             "task2_band": task2_score.overall_band,
#         })

#         summary = self._generate_summary(task1_score, task2_score, overall_band)

#         return WritingEvaluationResponse(
#             task1_score=task1_score,
#             task2_score=task2_score,
#             overall_writing_band=overall_band,
#             test_type=request.test_type,
#             time_taken_seconds=request.time_taken_seconds,
#             summary=summary,
#             strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
#             improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
#         )

#     async def _evaluate_task1(self, response_text, question, test_type):
#         logger.info("Evaluating Task 1...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

#         user_message = f"""
# CHART/TASK INFORMATION:
# Chart Type: {question.chart_type}
# Question Prompt: {question.prompt_text}
# Chart Description: {question.description}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 150)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(system_prompt, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _evaluate_task2(self, response_text, question):
#         logger.info("Evaluating Task 2...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         contractions = detect_contractions.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         user_message = f"""
# ESSAY QUESTION:
# Essay Type: {question.essay_type}
# Question: {question.prompt_text}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 250)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Contractions Found (errors in formal essay): {contractions}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _call_llm(self, system_prompt: str, user_message: str) -> str:
#         try:
#             messages = [
#                 SystemMessage(content=system_prompt),
#                 HumanMessage(content=user_message),
#             ]
#             response = await self.llm.ainvoke(messages)
#             return response.content
#         except Exception as e:
#             logger.error(f"LLM call failed: {e}")
#             raise

#     def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool) -> TaskScore:
#         try:
#             clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
#             clean = clean.rstrip('`').strip()
#             data = json.loads(clean)

#             recalculated_band = calculate_final_band.invoke({
#                 "task_achievement": data["band_task_achievement"],
#                 "coherence_cohesion": data["band_coherence_cohesion"],
#                 "lexical_resource": data["band_lexical_resource"],
#                 "grammatical_range": data["band_grammatical_range"],
#             })

#             errors = [
#                 WritingError(
#                     error_type=e.get("error_type", "grammar"),
#                     original=e.get("original", ""),
#                     correction=e.get("correction", ""),
#                     rule=e.get("rule", ""),
#                 )
#                 for e in data.get("errors", [])
#             ]

#             return TaskScore(
#                 band_task_achievement=data["band_task_achievement"],
#                 band_coherence_cohesion=data["band_coherence_cohesion"],
#                 band_lexical_resource=data["band_lexical_resource"],
#                 band_grammatical_range=data["band_grammatical_range"],
#                 overall_band=recalculated_band,
#                 feedback_task_achievement=data["feedback_task_achievement"],
#                 feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
#                 feedback_lexical_resource=data["feedback_lexical_resource"],
#                 feedback_grammatical_range=data["feedback_grammatical_range"],
#                 errors=errors,
#                 word_count=word_count,
#                 word_count_sufficient=word_count_sufficient,
#                 strengths=data.get("strengths", []),
#                 improvements=data.get("improvements", []),
#             )

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
#             raise ValueError(f"LLM returned invalid JSON: {e}")
#         except KeyError as e:
#             logger.error(f"Missing key: {e}")
#             raise ValueError(f"LLM response missing field: {e}")

#     def _generate_summary(self, task1, task2, overall):
#         if overall >= 7.0:
#             level, msg = "Good to Very Good", "You demonstrate strong writing skills."
#         elif overall >= 6.0:
#             level, msg = "Competent", "You have a good command of English with some inaccuracies."
#         elif overall >= 5.0:
#             level, msg = "Modest", "You have a partial command of English with noticeable limitations."
#         else:
#             level, msg = "Limited", "There are significant areas that need improvement."

#         return (
#             f"Overall Band: {overall} ({level}). {msg} "
#             f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
#             f"Task 2 carries twice the weight in your final score."
#         )









# # agents/writing_agent.py
# # LangChain Agent — IELTS Writing Evaluator (Groq)

# import asyncio
# import json
# import re
# from loguru import logger

# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, SystemMessage

# from core.config import settings
# from prompts.writing_prompts import (
#     TASK1_ACADEMIC_SYSTEM_PROMPT,
#     TASK1_GENERAL_SYSTEM_PROMPT,
#     TASK2_SYSTEM_PROMPT,
#     AI_DETECTION_SYSTEM_PROMPT,
# )
# from tools.writing_tools import (
#     check_bullet_points,
#     check_word_count_sufficient,
#     detect_contractions,
#     detect_informal_language,
#     calculate_final_band,
#     calculate_overall_writing_band,
#     calculate_sentence_burstiness,
#     calculate_vocabulary_diversity,
#     detect_repetitive_phrasing,
# )
# from schemas.writing_schema import (
#     WritingEvaluationRequest,
#     WritingEvaluationResponse,
#     TaskScore,
#     WritingError,
#     TestType,
#     AIDetectionResult,
#     WritingAIDetection,
# )

# # Ranking used to combine Task 1 + Task 2 AI-detection verdicts into one
# # overall verdict — we surface the MORE severe of the two to the user.
# _LIKELIHOOD_SEVERITY = {"low": 0, "medium": 1, "high": 2}
# _SEVERITY_TO_LIKELIHOOD = {v: k for k, v in _LIKELIHOOD_SEVERITY.items()}

# # Fallback used only if the AI-detection LLM call itself fails (e.g. Groq
# # outage, malformed JSON). We fail OPEN (report "low", flagged as unverified)
# # rather than blocking the whole evaluation or wrongly accusing the candidate.
# _AI_DETECTION_FALLBACK = AIDetectionResult(
#     likelihood="low",
#     confidence_score=0.0,
#     reasoning="Automated AI-content check could not be completed for this response.",
#     indicators=["check_unavailable"],
# )


# class WritingEvaluationAgent:
#     """
#     IELTS Writing Evaluation Agent.
#     Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.
#     """

#     def __init__(self):
#         self.llm = ChatGroq(
#             model=settings.LLM_MODEL,
#             groq_api_key=settings.GROQ_API_KEY,
#             max_tokens=settings.LLM_MAX_TOKENS,
#             temperature=settings.LLM_TEMPERATURE,
#         )
#         logger.info(f"WritingEvaluationAgent initialized — Model: {settings.LLM_MODEL}")

#     async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
#         logger.info(f"Starting evaluation — Type: {request.test_type}")

#         # Band scoring and AI-content detection are independent — run all
#         # 4 LLM calls concurrently instead of sequentially to cut latency.
#         task1_score, task2_score, ai_task1, ai_task2 = await asyncio.gather(
#             self._evaluate_task1(
#                 response_text=request.task1_response,
#                 question=request.task1_question,
#                 test_type=request.test_type,
#             ),
#             self._evaluate_task2(
#                 response_text=request.task2_response,
#                 question=request.task2_question,
#             ),
#             self._detect_ai_content(request.task1_response),
#             self._detect_ai_content(request.task2_response),
#         )

#         overall_band = calculate_overall_writing_band.invoke({
#             "task1_band": task1_score.overall_band,
#             "task2_band": task2_score.overall_band,
#         })

#         summary = self._generate_summary(task1_score, task2_score, overall_band)
#         ai_detection = self._aggregate_ai_detection(ai_task1, ai_task2)

#         return WritingEvaluationResponse(
#             task1_score=task1_score,
#             task2_score=task2_score,
#             overall_writing_band=overall_band,
#             test_type=request.test_type,
#             time_taken_seconds=request.time_taken_seconds,
#             summary=summary,
#             strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
#             improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
#             ai_detection=ai_detection,
#         )

#     async def _evaluate_task1(self, response_text, question, test_type):
#         logger.info("Evaluating Task 1...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

#         user_message = f"""
# CHART/TASK INFORMATION:
# Chart Type: {question.chart_type}
# Question Prompt: {question.prompt_text}
# Chart Description: {question.description}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 150)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(system_prompt, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _evaluate_task2(self, response_text, question):
#         logger.info("Evaluating Task 2...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         contractions = detect_contractions.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         user_message = f"""
# ESSAY QUESTION:
# Essay Type: {question.essay_type}
# Question: {question.prompt_text}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 250)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Contractions Found (errors in formal essay): {contractions}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _call_llm(self, system_prompt: str, user_message: str) -> str:
#         try:
#             messages = [
#                 SystemMessage(content=system_prompt),
#                 HumanMessage(content=user_message),
#             ]
#             response = await self.llm.ainvoke(messages)
#             return response.content
#         except Exception as e:
#             logger.error(f"LLM call failed: {e}")
#             raise

#     def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool) -> TaskScore:
#         try:
#             clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
#             clean = clean.rstrip('`').strip()
#             data = json.loads(clean)

#             recalculated_band = calculate_final_band.invoke({
#                 "task_achievement": data["band_task_achievement"],
#                 "coherence_cohesion": data["band_coherence_cohesion"],
#                 "lexical_resource": data["band_lexical_resource"],
#                 "grammatical_range": data["band_grammatical_range"],
#             })

#             errors = [
#                 WritingError(
#                     error_type=e.get("error_type", "grammar"),
#                     original=e.get("original", ""),
#                     correction=e.get("correction", ""),
#                     rule=e.get("rule", ""),
#                 )
#                 for e in data.get("errors", [])
#             ]

#             return TaskScore(
#                 band_task_achievement=data["band_task_achievement"],
#                 band_coherence_cohesion=data["band_coherence_cohesion"],
#                 band_lexical_resource=data["band_lexical_resource"],
#                 band_grammatical_range=data["band_grammatical_range"],
#                 overall_band=recalculated_band,
#                 feedback_task_achievement=data["feedback_task_achievement"],
#                 feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
#                 feedback_lexical_resource=data["feedback_lexical_resource"],
#                 feedback_grammatical_range=data["feedback_grammatical_range"],
#                 errors=errors,
#                 word_count=word_count,
#                 word_count_sufficient=word_count_sufficient,
#                 strengths=data.get("strengths", []),
#                 improvements=data.get("improvements", []),
#             )

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
#             raise ValueError(f"LLM returned invalid JSON: {e}")
#         except KeyError as e:
#             logger.error(f"Missing key: {e}")
#             raise ValueError(f"LLM response missing field: {e}")

#     def _generate_summary(self, task1, task2, overall):
#         if overall >= 7.0:
#             level, msg = "Good to Very Good", "You demonstrate strong writing skills."
#         elif overall >= 6.0:
#             level, msg = "Competent", "You have a good command of English with some inaccuracies."
#         elif overall >= 5.0:
#             level, msg = "Modest", "You have a partial command of English with noticeable limitations."
#         else:
#             level, msg = "Limited", "There are significant areas that need improvement."

#         return (
#             f"Overall Band: {overall} ({level}). {msg} "
#             f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
#             f"Task 2 carries twice the weight in your final score."
#         )

#     # ── AI-Content Detection ────────────────────────────────────────

#     async def _detect_ai_content(self, response_text: str) -> AIDetectionResult:
#         """
#         Assess likelihood that `response_text` was AI-generated.
#         Combines deterministic stylometric heuristics (computed in code,
#         not by the LLM) with an LLM judgment call that's grounded in
#         those signals. Fails open (returns a "low"/unverified result)
#         if the LLM call or parsing breaks, so a transient LLM issue
#         never blocks the candidate's evaluation.
#         """
#         try:
#             burstiness = calculate_sentence_burstiness.invoke({"text": response_text})
#             vocab_diversity = calculate_vocabulary_diversity.invoke({"text": response_text})
#             repetition = detect_repetitive_phrasing.invoke({"text": response_text})

#             user_message = f"""
# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-COMPUTED STYLOMETRIC SIGNALS:
# - Sentence burstiness (higher = more human-like variance): {burstiness}
# - Vocabulary diversity (type-token ratio): {vocab_diversity}
# - Repetitive phrasing / generic AI transitions: {repetition}

# Return ONLY valid JSON. No extra text.
# """
#             raw = await self._call_llm(AI_DETECTION_SYSTEM_PROMPT, user_message)
#             clean = re.sub(r'```(?:json)?\n?', '', raw).strip().rstrip('`').strip()
#             data = json.loads(clean)

#             return AIDetectionResult(
#                 likelihood=data["likelihood"],
#                 confidence_score=float(data["confidence_score"]),
#                 reasoning=data["reasoning"],
#                 indicators=data.get("indicators", []),
#             )

#         except Exception as e:
#             logger.warning(f"AI-detection check failed, failing open: {e}")
#             return _AI_DETECTION_FALLBACK

#     def _aggregate_ai_detection(
#         self, task1_result: AIDetectionResult, task2_result: AIDetectionResult
#     ) -> WritingAIDetection:
#         """
#         Combine Task 1 + Task 2 AI-detection verdicts into one overall
#         verdict. We surface the MORE severe likelihood of the two
#         (better to under-clear than to hide a flagged task), and
#         average the confidence scores.
#         """
#         more_severe = max(
#             task1_result.likelihood,
#             task2_result.likelihood,
#             key=lambda l: _LIKELIHOOD_SEVERITY[l],
#         )
#         avg_confidence = round(
#             (task1_result.confidence_score + task2_result.confidence_score) / 2, 3
#         )

#         return WritingAIDetection(
#             task1=task1_result,
#             task2=task2_result,
#             overall_likelihood=more_severe,
#             overall_confidence_score=avg_confidence,
#         )





































# # agents/writing_agent.py
# # LangChain Agent — IELTS Writing Evaluator (Groq)

# import asyncio
# import json
# import re
# from loguru import logger

# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, SystemMessage

# from core.config import settings
# from prompts.writing_prompts import (
#     TASK1_ACADEMIC_SYSTEM_PROMPT,
#     TASK1_GENERAL_SYSTEM_PROMPT,
#     TASK2_SYSTEM_PROMPT,
#     AI_DETECTION_SYSTEM_PROMPT,
# )
# from tools.writing_tools import (
#     check_bullet_points,
#     check_word_count_sufficient,
#     detect_contractions,
#     detect_informal_language,
#     calculate_final_band,
#     calculate_overall_writing_band,
#     calculate_sentence_burstiness,
#     calculate_vocabulary_diversity,
#     detect_repetitive_phrasing,
# )
# from schemas.writing_schema import (
#     WritingEvaluationRequest,
#     WritingEvaluationResponse,
#     TaskScore,
#     WritingError,
#     TestType,
#     AIDetectionResult,
#     WritingAIDetection,
# )

# # Ranking used to combine Task 1 + Task 2 AI-detection verdicts into one
# # overall verdict — we surface the MORE severe of the two to the user.
# _LIKELIHOOD_SEVERITY = {"low": 0, "medium": 1, "high": 2}
# _SEVERITY_TO_LIKELIHOOD = {v: k for k, v in _LIKELIHOOD_SEVERITY.items()}

# # Fallback used only if the AI-detection LLM call itself fails (e.g. Groq
# # outage, malformed JSON). We fail OPEN (report "low", flagged as unverified)
# # rather than blocking the whole evaluation or wrongly accusing the candidate.
# _AI_DETECTION_FALLBACK = AIDetectionResult(
#     likelihood="low",
#     confidence_score=0.0,
#     reasoning="Automated AI-content check could not be completed for this response.",
#     indicators=["check_unavailable"],
# )


# class WritingEvaluationAgent:
#     """
#     IELTS Writing Evaluation Agent.
#     Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.
#     """

#     def __init__(self):
#         self.llm = ChatGroq(
#             model=settings.LLM_MODEL,
#             groq_api_key=settings.GROQ_API_KEY,
#             max_tokens=settings.LLM_MAX_TOKENS,
#             temperature=settings.LLM_TEMPERATURE,
#         )
#         logger.info(f"WritingEvaluationAgent initialized — Model: {settings.LLM_MODEL}")

#     async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
#         logger.info(f"Starting evaluation — Type: {request.test_type}")

#         # Band scoring and AI-content detection are independent — run all
#         # 4 LLM calls concurrently instead of sequentially to cut latency.
#         task1_score, task2_score, ai_task1, ai_task2 = await asyncio.gather(
#             self._evaluate_task1(
#                 response_text=request.task1_response,
#                 question=request.task1_question,
#                 test_type=request.test_type,
#             ),
#             self._evaluate_task2(
#                 response_text=request.task2_response,
#                 question=request.task2_question,
#             ),
#             self._detect_ai_content(request.task1_response),
#             self._detect_ai_content(request.task2_response),
#         )

#         overall_band = calculate_overall_writing_band.invoke({
#             "task1_band": task1_score.overall_band,
#             "task2_band": task2_score.overall_band,
#         })

#         summary = self._generate_summary(task1_score, task2_score, overall_band)
#         ai_detection = self._aggregate_ai_detection(ai_task1, ai_task2)

#         return WritingEvaluationResponse(
#             task1_score=task1_score,
#             task2_score=task2_score,
#             overall_writing_band=overall_band,
#             test_type=request.test_type,
#             time_taken_seconds=request.time_taken_seconds,
#             summary=summary,
#             strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
#             improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
#             ai_detection=ai_detection,
#         )

#     async def _evaluate_task1(self, response_text, question, test_type):
#         logger.info("Evaluating Task 1...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

#         user_message = f"""
# CHART/TASK INFORMATION:
# Chart Type: {question.chart_type}
# Question Prompt: {question.prompt_text}
# Chart Description: {question.description}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 150)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(system_prompt, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _evaluate_task2(self, response_text, question):
#         logger.info("Evaluating Task 2...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         contractions = detect_contractions.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         user_message = f"""
# ESSAY QUESTION:
# Essay Type: {question.essay_type}
# Question: {question.prompt_text}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 250)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Contractions Found (errors in formal essay): {contractions}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _call_llm(self, system_prompt: str, user_message: str) -> str:
#         try:
#             messages = [
#                 SystemMessage(content=system_prompt),
#                 HumanMessage(content=user_message),
#             ]
#             response = await self.llm.ainvoke(messages)
#             return response.content
#         except Exception as e:
#             logger.error(f"LLM call failed: {e}")
#             raise

#     def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool) -> TaskScore:
#         try:
#             clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
#             clean = clean.rstrip('`').strip()
#             data = json.loads(clean)

#             recalculated_band = calculate_final_band.invoke({
#                 "task_achievement": data["band_task_achievement"],
#                 "coherence_cohesion": data["band_coherence_cohesion"],
#                 "lexical_resource": data["band_lexical_resource"],
#                 "grammatical_range": data["band_grammatical_range"],
#             })

#             errors = [
#                 WritingError(
#                     error_type=e.get("error_type", "grammar"),
#                     original=e.get("original", ""),
#                     correction=e.get("correction", ""),
#                     rule=e.get("rule", ""),
#                 )
#                 for e in data.get("errors", [])
#             ]

#             return TaskScore(
#                 band_task_achievement=data["band_task_achievement"],
#                 band_coherence_cohesion=data["band_coherence_cohesion"],
#                 band_lexical_resource=data["band_lexical_resource"],
#                 band_grammatical_range=data["band_grammatical_range"],
#                 overall_band=recalculated_band,
#                 feedback_task_achievement=data["feedback_task_achievement"],
#                 feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
#                 feedback_lexical_resource=data["feedback_lexical_resource"],
#                 feedback_grammatical_range=data["feedback_grammatical_range"],
#                 errors=errors,
#                 word_count=word_count,
#                 word_count_sufficient=word_count_sufficient,
#                 strengths=data.get("strengths", []),
#                 improvements=data.get("improvements", []),
#             )

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
#             raise ValueError(f"LLM returned invalid JSON: {e}")
#         except KeyError as e:
#             logger.error(f"Missing key: {e}")
#             raise ValueError(f"LLM response missing field: {e}")

#     def _generate_summary(self, task1, task2, overall):
#         if overall >= 7.0:
#             level, msg = "Good to Very Good", "You demonstrate strong writing skills."
#         elif overall >= 6.0:
#             level, msg = "Competent", "You have a good command of English with some inaccuracies."
#         elif overall >= 5.0:
#             level, msg = "Modest", "You have a partial command of English with noticeable limitations."
#         else:
#             level, msg = "Limited", "There are significant areas that need improvement."

#         return (
#             f"Overall Band: {overall} ({level}). {msg} "
#             f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
#             f"Task 2 carries twice the weight in your final score."
#         )

#     # ── AI-Content Detection ────────────────────────────────────────

#     async def _detect_ai_content(self, response_text: str) -> AIDetectionResult:
#         """
#         Assess likelihood that `response_text` was AI-generated.
#         Combines deterministic stylometric heuristics (computed in code,
#         not by the LLM) with an LLM judgment call that's grounded in
#         those signals. Fails open (returns a "low"/unverified result)
#         if the LLM call or parsing breaks, so a transient LLM issue
#         never blocks the candidate's evaluation.
#         """
#         try:
#             burstiness = calculate_sentence_burstiness.invoke({"text": response_text})
#             vocab_diversity = calculate_vocabulary_diversity.invoke({"text": response_text})
#             repetition = detect_repetitive_phrasing.invoke({"text": response_text})

#             is_low_burstiness = burstiness.get("is_low_burstiness", False)
#             is_low_diversity = vocab_diversity.get("is_low_diversity", False)
#             has_multiple_generic = repetition.get("has_multiple_generic_phrases", False)

#             user_message = f"""
# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-COMPUTED STYLOMETRIC SIGNALS:
# - Sentence burstiness: {burstiness}
#   → is_low_burstiness = {is_low_burstiness} (True is an AI-leaning signal)
# - Vocabulary diversity: {vocab_diversity}
#   → is_low_diversity = {is_low_diversity} (True is an AI-leaning signal)
# - Repetitive phrasing / generic AI transitions: {repetition}
#   → has_multiple_generic_phrases = {has_multiple_generic} (True is a STRONG AI-leaning signal — 2+ generic/templated phrases found)

# Per your calibration rules: if has_multiple_generic_phrases is True, or if two or
# more of these three flags are True together, that alone is sufficient to classify
# as "high" — do not require additional evidence beyond what's already given above.

# Return ONLY valid JSON. No extra text.
# """
#             raw = await self._call_llm(AI_DETECTION_SYSTEM_PROMPT, user_message)
#             clean = re.sub(r'```(?:json)?\n?', '', raw).strip().rstrip('`').strip()
#             data = json.loads(clean)

#             return AIDetectionResult(
#                 likelihood=data["likelihood"],
#                 confidence_score=float(data["confidence_score"]),
#                 reasoning=data["reasoning"],
#                 indicators=data.get("indicators", []),
#             )

#         except Exception as e:
#             logger.warning(f"AI-detection check failed, failing open: {e}")
#             return _AI_DETECTION_FALLBACK

#     def _aggregate_ai_detection(
#         self, task1_result: AIDetectionResult, task2_result: AIDetectionResult
#     ) -> WritingAIDetection:
#         """
#         Combine Task 1 + Task 2 AI-detection verdicts into one overall
#         verdict. We surface the MORE severe likelihood of the two
#         (better to under-clear than to hide a flagged task), and
#         average the confidence scores.
#         """
#         more_severe = max(
#             task1_result.likelihood,
#             task2_result.likelihood,
#             key=lambda l: _LIKELIHOOD_SEVERITY[l],
#         )
#         avg_confidence = round(
#             (task1_result.confidence_score + task2_result.confidence_score) / 2, 3
#         )

#         return WritingAIDetection(
#             task1=task1_result,
#             task2=task2_result,
#             overall_likelihood=more_severe,
#             overall_confidence_score=avg_confidence,
#         )























# # agents/writing_agent.py
# # LangChain Agent — IELTS Writing Evaluator (Groq)

# import asyncio
# import json
# import re
# from loguru import logger

# from langchain_groq import ChatGroq
# from langchain_core.messages import HumanMessage, SystemMessage

# from core.config import settings
# from prompts.writing_prompts import (
#     TASK1_ACADEMIC_SYSTEM_PROMPT,
#     TASK1_GENERAL_SYSTEM_PROMPT,
#     TASK2_SYSTEM_PROMPT,
#     AI_DETECTION_SYSTEM_PROMPT,
# )
# from tools.writing_tools import (
#     check_bullet_points,
#     check_word_count_sufficient,
#     detect_contractions,
#     detect_informal_language,
#     calculate_final_band,
#     calculate_overall_writing_band,
#     calculate_sentence_burstiness,
#     calculate_vocabulary_diversity,
#     detect_repetitive_phrasing,
# )
# from schemas.writing_schema import (
#     WritingEvaluationRequest,
#     WritingEvaluationResponse,
#     TaskScore,
#     WritingError,
#     TestType,
#     AIDetectionResult,
#     WritingAIDetection,
# )

# # Ranking used to combine Task 1 + Task 2 AI-detection verdicts into one
# # overall verdict — we surface the MORE severe of the two to the user.
# _LIKELIHOOD_SEVERITY = {"low": 0, "medium": 1, "high": 2}
# _SEVERITY_TO_LIKELIHOOD = {v: k for k, v in _LIKELIHOOD_SEVERITY.items()}

# # Fallback used only if the AI-detection LLM call itself fails (e.g. Groq
# # outage, malformed JSON). We fail OPEN (report "low", flagged as unverified)
# # rather than blocking the whole evaluation or wrongly accusing the candidate.
# _AI_DETECTION_FALLBACK = AIDetectionResult(
#     likelihood="low",
#     confidence_score=0.0,
#     reasoning="Automated AI-content check could not be completed for this response.",
#     indicators=["check_unavailable"],
# )


# class WritingEvaluationAgent:
#     """
#     IELTS Writing Evaluation Agent.
#     Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.
#     """

#     def __init__(self):
#         self.llm = ChatGroq(
#             model=settings.LLM_MODEL,
#             groq_api_key=settings.GROQ_API_KEY,
#             max_tokens=settings.LLM_MAX_TOKENS,
#             temperature=settings.LLM_TEMPERATURE,
#         )
#         logger.info(f"WritingEvaluationAgent initialized — Model: {settings.LLM_MODEL}")

#     async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
#         logger.info(f"Starting evaluation — Type: {request.test_type}")

#         # Band scoring and AI-content detection are independent — run all
#         # 4 LLM calls concurrently instead of sequentially to cut latency.
#         task1_score, task2_score, ai_task1, ai_task2 = await asyncio.gather(
#             self._evaluate_task1(
#                 response_text=request.task1_response,
#                 question=request.task1_question,
#                 test_type=request.test_type,
#             ),
#             self._evaluate_task2(
#                 response_text=request.task2_response,
#                 question=request.task2_question,
#             ),
#             self._detect_ai_content(request.task1_response),
#             self._detect_ai_content(request.task2_response),
#         )

#         overall_band = calculate_overall_writing_band.invoke({
#             "task1_band": task1_score.overall_band,
#             "task2_band": task2_score.overall_band,
#         })

#         summary = self._generate_summary(task1_score, task2_score, overall_band)
#         ai_detection = self._aggregate_ai_detection(ai_task1, ai_task2)

#         return WritingEvaluationResponse(
#             task1_score=task1_score,
#             task2_score=task2_score,
#             overall_writing_band=overall_band,
#             test_type=request.test_type,
#             time_taken_seconds=request.time_taken_seconds,
#             summary=summary,
#             strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
#             improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
#             ai_detection=ai_detection,
#         )

#     async def _evaluate_task1(self, response_text, question, test_type):
#         logger.info("Evaluating Task 1...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

#         user_message = f"""
# CHART/TASK INFORMATION:
# Chart Type: {question.chart_type}
# Question Prompt: {question.prompt_text}
# Chart Description: {question.description}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 150)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(system_prompt, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _evaluate_task2(self, response_text, question):
#         logger.info("Evaluating Task 2...")

#         wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
#         has_bullets = check_bullet_points.invoke({"text": response_text})
#         contractions = detect_contractions.invoke({"text": response_text})
#         informal_words = detect_informal_language.invoke({"text": response_text})

#         user_message = f"""
# ESSAY QUESTION:
# Essay Type: {question.essay_type}
# Question: {question.prompt_text}

# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-ANALYSIS:
# - Word Count: {wc_check['word_count']} (minimum 250)
# - Word Count Sufficient: {wc_check['sufficient']}
# - Bullet Points Found: {has_bullets}
# - Contractions Found (errors in formal essay): {contractions}
# - Informal Language: {informal_words}

# Return ONLY valid JSON. No extra text.
# """
#         llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
#         return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

#     async def _call_llm(self, system_prompt: str, user_message: str) -> str:
#         try:
#             messages = [
#                 SystemMessage(content=system_prompt),
#                 HumanMessage(content=user_message),
#             ]
#             response = await self.llm.ainvoke(messages)
#             return response.content
#         except Exception as e:
#             logger.error(f"LLM call failed: {e}")
#             raise

#     def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool) -> TaskScore:
#         try:
#             clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
#             clean = clean.rstrip('`').strip()
#             # strict=False: tolerate raw control characters (e.g. literal
#             # newlines) inside LLM-generated string values instead of
#             # erroring — same fix as question_agent.py's _parse_json.
#             data = json.loads(clean, strict=False)

#             recalculated_band = calculate_final_band.invoke({
#                 "task_achievement": data["band_task_achievement"],
#                 "coherence_cohesion": data["band_coherence_cohesion"],
#                 "lexical_resource": data["band_lexical_resource"],
#                 "grammatical_range": data["band_grammatical_range"],
#             })

#             errors = [
#                 WritingError(
#                     error_type=e.get("error_type", "grammar"),
#                     original=e.get("original", ""),
#                     correction=e.get("correction", ""),
#                     rule=e.get("rule", ""),
#                 )
#                 for e in data.get("errors", [])
#             ]

#             return TaskScore(
#                 band_task_achievement=data["band_task_achievement"],
#                 band_coherence_cohesion=data["band_coherence_cohesion"],
#                 band_lexical_resource=data["band_lexical_resource"],
#                 band_grammatical_range=data["band_grammatical_range"],
#                 overall_band=recalculated_band,
#                 feedback_task_achievement=data["feedback_task_achievement"],
#                 feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
#                 feedback_lexical_resource=data["feedback_lexical_resource"],
#                 feedback_grammatical_range=data["feedback_grammatical_range"],
#                 errors=errors,
#                 word_count=word_count,
#                 word_count_sufficient=word_count_sufficient,
#                 strengths=data.get("strengths", []),
#                 improvements=data.get("improvements", []),
#             )

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
#             raise ValueError(f"LLM returned invalid JSON: {e}")
#         except KeyError as e:
#             logger.error(f"Missing key: {e}")
#             raise ValueError(f"LLM response missing field: {e}")

#     def _generate_summary(self, task1, task2, overall):
#         if overall >= 7.0:
#             level, msg = "Good to Very Good", "You demonstrate strong writing skills."
#         elif overall >= 6.0:
#             level, msg = "Competent", "You have a good command of English with some inaccuracies."
#         elif overall >= 5.0:
#             level, msg = "Modest", "You have a partial command of English with noticeable limitations."
#         else:
#             level, msg = "Limited", "There are significant areas that need improvement."

#         return (
#             f"Overall Band: {overall} ({level}). {msg} "
#             f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
#             f"Task 2 carries twice the weight in your final score."
#         )

#     # ── AI-Content Detection ────────────────────────────────────────

#     async def _detect_ai_content(self, response_text: str) -> AIDetectionResult:
#         """
#         Assess likelihood that `response_text` was AI-generated.
#         Combines deterministic stylometric heuristics (computed in code,
#         not by the LLM) with an LLM judgment call that's grounded in
#         those signals. Fails open (returns a "low"/unverified result)
#         if the LLM call or parsing breaks, so a transient LLM issue
#         never blocks the candidate's evaluation.
#         """
#         try:
#             burstiness = calculate_sentence_burstiness.invoke({"text": response_text})
#             vocab_diversity = calculate_vocabulary_diversity.invoke({"text": response_text})
#             repetition = detect_repetitive_phrasing.invoke({"text": response_text})

#             is_low_burstiness = burstiness.get("is_low_burstiness", False)
#             is_low_diversity = vocab_diversity.get("is_low_diversity", False)
#             has_multiple_generic = repetition.get("has_multiple_generic_phrases", False)

#             user_message = f"""
# CANDIDATE'S RESPONSE:
# {response_text}

# PRE-COMPUTED STYLOMETRIC SIGNALS:
# - Sentence burstiness: {burstiness}
#   → is_low_burstiness = {is_low_burstiness} (True is an AI-leaning signal)
# - Vocabulary diversity: {vocab_diversity}
#   → is_low_diversity = {is_low_diversity} (True is an AI-leaning signal)
# - Repetitive phrasing / generic AI transitions: {repetition}
#   → has_multiple_generic_phrases = {has_multiple_generic} (True is a STRONG AI-leaning signal — 2+ generic/templated phrases found)

# Per your calibration rules: if has_multiple_generic_phrases is True, or if two or
# more of these three flags are True together, that alone is sufficient to classify
# as "high" — do not require additional evidence beyond what's already given above.

# Return ONLY valid JSON. No extra text.
# """
#             raw = await self._call_llm(AI_DETECTION_SYSTEM_PROMPT, user_message)
#             clean = re.sub(r'```(?:json)?\n?', '', raw).strip().rstrip('`').strip()
#             # strict=False: same control-character tolerance fix as elsewhere.
#             data = json.loads(clean, strict=False)

#             return AIDetectionResult(
#                 likelihood=data["likelihood"],
#                 confidence_score=float(data["confidence_score"]),
#                 reasoning=data["reasoning"],
#                 indicators=data.get("indicators", []),
#             )

#         except Exception as e:
#             logger.warning(f"AI-detection check failed, failing open: {e}")
#             return _AI_DETECTION_FALLBACK

#     def _aggregate_ai_detection(
#         self, task1_result: AIDetectionResult, task2_result: AIDetectionResult
#     ) -> WritingAIDetection:
#         """
#         Combine Task 1 + Task 2 AI-detection verdicts into one overall
#         verdict. We surface the MORE severe likelihood of the two
#         (better to under-clear than to hide a flagged task), and
#         average the confidence scores.
#         """
#         more_severe = max(
#             task1_result.likelihood,
#             task2_result.likelihood,
#             key=lambda l: _LIKELIHOOD_SEVERITY[l],
#         )
#         avg_confidence = round(
#             (task1_result.confidence_score + task2_result.confidence_score) / 2, 3
#         )

#         return WritingAIDetection(
#             task1=task1_result,
#             task2=task2_result,
#             overall_likelihood=more_severe,
#             overall_confidence_score=avg_confidence,
#         )

































# agents/writing_agent.py
# LangChain Agent — IELTS Writing Evaluator (Groq)

import asyncio
import json
import re
from typing import Optional
from loguru import logger

from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage

from core.config import settings
from prompts.writing_prompts import (
    TASK1_ACADEMIC_SYSTEM_PROMPT,
    TASK1_GENERAL_SYSTEM_PROMPT,
    TASK2_SYSTEM_PROMPT,
)
from tools.writing_tools import (
    check_bullet_points,
    check_word_count_sufficient,
    detect_contractions,
    detect_informal_language,
    calculate_final_band,
    calculate_overall_writing_band,
    calculate_sentence_burstiness,
    calculate_vocabulary_diversity,
    detect_repetitive_phrasing,
)
from schemas.writing_schema import (
    WritingEvaluationRequest,
    WritingEvaluationResponse,
    TaskScore,
    WritingError,
    TestType,
    AIDetectionResult,
    WritingAIDetection,
)

# Ranking used to combine Task 1 + Task 2 AI-detection verdicts into one
# overall verdict — we surface the MORE severe of the two to the user.
_LIKELIHOOD_SEVERITY = {"low": 0, "medium": 1, "high": 2}

# Fallback used only if the AI-detection portion of a response can't be
# parsed. We fail OPEN (report "low", flagged as unverified) rather than
# blocking the whole evaluation or wrongly accusing the candidate.
_AI_DETECTION_FALLBACK = AIDetectionResult(
    likelihood="low",
    confidence_score=0.0,
    reasoning="Automated AI-content check could not be completed for this response.",
    indicators=["check_unavailable"],
)

# Substrings used to recognize a rate-limit-style failure across whatever
# exception shape the Groq/OpenAI-compatible client raises, without a hard
# dependency on a specific exception class (keeps this resilient if the
# underlying SDK's error types change).
_RATE_LIMIT_MARKERS = ("rate limit", "rate_limit", "429", "quota", "too many requests")

# Retry/backoff for transient rate-limit errors — cheap insurance since a
# single retry a couple seconds later very often succeeds once the token
# bucket refills, and it's far better UX than failing the whole test.
_MAX_LLM_RETRIES = 3
_RETRY_BACKOFF_SECONDS = (2, 4, 8)


class RateLimitExceededError(Exception):
    """Raised when the LLM provider's rate limit persists after retries.
    Caught specifically in routes/writing.py to return a clear, friendly
    503 instead of a generic 500 — the user should know to just wait and
    retry, not think the app is broken."""
    pass


class WritingEvaluationAgent:
    """
    IELTS Writing Evaluation Agent.
    Uses LangChain + Groq (free) to evaluate Task 1 and Task 2.

    Each task's band scoring AND AI-authorship check are done in a SINGLE
    combined LLM call (see prompts/writing_prompts.py) rather than two
    separate calls — this halves both the number of Groq API requests and
    the total system-prompt tokens sent per evaluation, directly reducing
    how often the account's rate limit gets hit.
    """

from core.dynamic_settings import get_chat_groq

class WritingEvaluationAgent:
    """
    IELTS Writing Evaluation Agent.
    Evaluates Task 1 and Task 2 using Groq with dynamic system settings.
    """

    def __init__(self):
        self.llm = get_chat_groq()
        logger.info(f"WritingEvaluationAgent initialized — Dynamic Model config")

    async def evaluate(self, request: WritingEvaluationRequest) -> WritingEvaluationResponse:
        logger.info(f"Starting evaluation — Type: {request.test_type}")

        # Only 2 LLM calls total now (was 4) — scoring + AI-detection are
        # merged into one call per task.
        (task1_score, ai_task1), (task2_score, ai_task2) = await asyncio.gather(
            self._evaluate_task1(
                response_text=request.task1_response,
                question=request.task1_question,
                test_type=request.test_type,
            ),
            self._evaluate_task2(
                response_text=request.task2_response,
                question=request.task2_question,
            ),
        )

        overall_band = calculate_overall_writing_band.invoke({
            "task1_band": task1_score.overall_band,
            "task2_band": task2_score.overall_band,
        })

        summary = self._generate_summary(task1_score, task2_score, overall_band)
        ai_detection = self._aggregate_ai_detection(ai_task1, ai_task2)

        return WritingEvaluationResponse(
            task1_score=task1_score,
            task2_score=task2_score,
            overall_writing_band=overall_band,
            test_type=request.test_type,
            time_taken_seconds=request.time_taken_seconds,
            summary=summary,
            strengths=list(set(task1_score.strengths + task2_score.strengths))[:4],
            improvements=list(set(task1_score.improvements + task2_score.improvements))[:4],
            ai_detection=ai_detection,
        )

    async def _evaluate_task1(self, response_text, question, test_type):
        logger.info("Evaluating Task 1 (scoring + AI-check combined)...")

        wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 150})
        has_bullets = check_bullet_points.invoke({"text": response_text})
        informal_words = detect_informal_language.invoke({"text": response_text})
        stylometrics = self._compute_stylometric_summary(response_text)

        system_prompt = TASK1_ACADEMIC_SYSTEM_PROMPT if test_type == TestType.ACADEMIC else TASK1_GENERAL_SYSTEM_PROMPT

        user_message = f"""
CHART/TASK INFORMATION:
Chart Type: {question.chart_type}
Question Prompt: {question.prompt_text}
Chart Description: {question.description}

CANDIDATE'S RESPONSE:
{response_text}

PRE-ANALYSIS:
- Word Count: {wc_check['word_count']} (minimum 150)
- Word Count Sufficient: {wc_check['sufficient']}
- Bullet Points Found: {has_bullets}
- Informal Language: {informal_words}
{stylometrics}

Return ONLY valid JSON matching the schema (including ai_detection). No extra text.
"""
        llm_response = await self._call_llm(system_prompt, user_message)
        return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

    async def _evaluate_task2(self, response_text, question):
        logger.info("Evaluating Task 2 (scoring + AI-check combined)...")

        wc_check = check_word_count_sufficient.invoke({"text": response_text, "minimum": 250})
        has_bullets = check_bullet_points.invoke({"text": response_text})
        contractions = detect_contractions.invoke({"text": response_text})
        informal_words = detect_informal_language.invoke({"text": response_text})
        stylometrics = self._compute_stylometric_summary(response_text)

        user_message = f"""
ESSAY QUESTION:
Essay Type: {question.essay_type}
Question: {question.prompt_text}

CANDIDATE'S RESPONSE:
{response_text}

PRE-ANALYSIS:
- Word Count: {wc_check['word_count']} (minimum 250)
- Word Count Sufficient: {wc_check['sufficient']}
- Bullet Points Found: {has_bullets}
- Contractions Found (errors in formal essay): {contractions}
- Informal Language: {informal_words}
{stylometrics}

Return ONLY valid JSON matching the schema (including ai_detection). No extra text.
"""
        llm_response = await self._call_llm(TASK2_SYSTEM_PROMPT, user_message)
        return self._parse_task_score(llm_response, wc_check['word_count'], wc_check['sufficient'])

    def _compute_stylometric_summary(self, response_text: str) -> str:
        """Shared stylometric block appended to both task prompts — used
        by the merged AI-detection section of the scoring prompt."""
        burstiness = calculate_sentence_burstiness.invoke({"text": response_text})
        vocab_diversity = calculate_vocabulary_diversity.invoke({"text": response_text})
        repetition = detect_repetitive_phrasing.invoke({"text": response_text})

        is_low_burstiness = burstiness.get("is_low_burstiness", False)
        is_low_diversity = vocab_diversity.get("is_low_diversity", False)
        has_multiple_generic = repetition.get("has_multiple_generic_phrases", False)

        return f"""
STYLOMETRIC SIGNALS (for ai_detection):
- Burstiness: {burstiness} → is_low_burstiness={is_low_burstiness} (AI-leaning if True)
- Vocab diversity: {vocab_diversity} → is_low_diversity={is_low_diversity} (AI-leaning if True)
- Repetition/generic phrases: {repetition} → has_multiple_generic_phrases={has_multiple_generic} (STRONG AI signal if True)"""

    async def _call_llm(self, system_prompt: str, user_message: str) -> str:
        """
        Calls the LLM with retry + exponential backoff specifically for
        transient rate-limit errors. Non-rate-limit errors are raised
        immediately (retrying those would just waste time and tokens).
        """
        last_error: Optional[Exception] = None

        for attempt in range(_MAX_LLM_RETRIES):
            try:
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_message),
                ]
                response = await self.llm.ainvoke(messages)
                return response.content

            except Exception as e:
                last_error = e
                is_rate_limit = any(marker in str(e).lower() for marker in _RATE_LIMIT_MARKERS)

                if not is_rate_limit:
                    logger.error(f"LLM call failed (non-rate-limit): {e}")
                    raise

                if attempt < _MAX_LLM_RETRIES - 1:
                    wait = _RETRY_BACKOFF_SECONDS[attempt]
                    logger.warning(
                        f"Groq rate limit hit (attempt {attempt + 1}/{_MAX_LLM_RETRIES}), "
                        f"retrying in {wait}s..."
                    )
                    await asyncio.sleep(wait)
                else:
                    logger.error(f"Groq rate limit persisted after {_MAX_LLM_RETRIES} attempts: {e}")

        raise RateLimitExceededError(
            "Our AI examiner is experiencing high demand right now. "
            "Please wait a minute and try submitting again — your answers are safe."
        ) from last_error

    def _parse_task_score(self, llm_response: str, word_count: int, word_count_sufficient: bool):
        """Returns (TaskScore, AIDetectionResult) parsed from one merged response."""
        try:
            clean = re.sub(r'```(?:json)?\n?', '', llm_response).strip()
            clean = clean.rstrip('`').strip()
            # strict=False: tolerate raw control characters (e.g. literal
            # newlines) inside LLM-generated string values instead of
            # erroring — same fix as question_agent.py's _parse_json.
            data = json.loads(clean, strict=False)

            recalculated_band = calculate_final_band.invoke({
                "task_achievement": data["band_task_achievement"],
                "coherence_cohesion": data["band_coherence_cohesion"],
                "lexical_resource": data["band_lexical_resource"],
                "grammatical_range": data["band_grammatical_range"],
            })

            errors = [
                WritingError(
                    error_type=e.get("error_type", "grammar"),
                    original=e.get("original", ""),
                    correction=e.get("correction", ""),
                    rule=e.get("rule", ""),
                )
                for e in data.get("errors", [])
            ]

            score = TaskScore(
                band_task_achievement=data["band_task_achievement"],
                band_coherence_cohesion=data["band_coherence_cohesion"],
                band_lexical_resource=data["band_lexical_resource"],
                band_grammatical_range=data["band_grammatical_range"],
                overall_band=recalculated_band,
                feedback_task_achievement=data["feedback_task_achievement"],
                feedback_coherence_cohesion=data["feedback_coherence_cohesion"],
                feedback_lexical_resource=data["feedback_lexical_resource"],
                feedback_grammatical_range=data["feedback_grammatical_range"],
                errors=errors,
                word_count=word_count,
                word_count_sufficient=word_count_sufficient,
                strengths=data.get("strengths", []),
                improvements=data.get("improvements", []),
            )

            ai_raw = data.get("ai_detection")
            if ai_raw:
                try:
                    ai_result = AIDetectionResult(
                        likelihood=ai_raw["likelihood"],
                        confidence_score=float(ai_raw["confidence_score"]),
                        reasoning=ai_raw["reasoning"],
                        indicators=ai_raw.get("indicators", []),
                    )
                except (KeyError, ValueError, TypeError) as e:
                    logger.warning(f"ai_detection sub-object malformed, failing open: {e}")
                    ai_result = _AI_DETECTION_FALLBACK
            else:
                logger.warning("ai_detection missing from LLM response, failing open")
                ai_result = _AI_DETECTION_FALLBACK

            return score, ai_result

        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}\nRaw: {llm_response}")
            raise ValueError(f"LLM returned invalid JSON: {e}")
        except KeyError as e:
            logger.error(f"Missing key: {e}")
            raise ValueError(f"LLM response missing field: {e}")

    def _generate_summary(self, task1, task2, overall):
        if overall >= 7.0:
            level, msg = "Good to Very Good", "You demonstrate strong writing skills."
        elif overall >= 6.0:
            level, msg = "Competent", "You have a good command of English with some inaccuracies."
        elif overall >= 5.0:
            level, msg = "Modest", "You have a partial command of English with noticeable limitations."
        else:
            level, msg = "Limited", "There are significant areas that need improvement."

        return (
            f"Overall Band: {overall} ({level}). {msg} "
            f"Task 1: {task1.overall_band} | Task 2: {task2.overall_band}. "
            f"Task 2 carries twice the weight in your final score."
        )

    def _aggregate_ai_detection(
        self, task1_result: AIDetectionResult, task2_result: AIDetectionResult
    ) -> WritingAIDetection:
        """
        Combine Task 1 + Task 2 AI-detection verdicts into one overall
        verdict. We surface the MORE severe likelihood of the two
        (better to under-clear than to hide a flagged task), and
        average the confidence scores.
        """
        more_severe = max(
            task1_result.likelihood,
            task2_result.likelihood,
            key=lambda l: _LIKELIHOOD_SEVERITY[l],
        )
        avg_confidence = round(
            (task1_result.confidence_score + task2_result.confidence_score) / 2, 3
        )

        return WritingAIDetection(
            task1=task1_result,
            task2=task2_result,
            overall_likelihood=more_severe,
            overall_confidence_score=avg_confidence,
        )