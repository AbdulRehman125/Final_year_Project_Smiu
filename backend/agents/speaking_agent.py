# import json
# import os
# from typing import List, Optional
# from groq import Groq
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# LLM_MODEL = "llama-3.3-70b-versatile"


# class SpeakingAgent:
#     """
#     IELTS examiner agent.
#     Ek session ke liye ek instance.
#     Conversation history khud track karta hai.
#     """

#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
#         self.part2_topic: Optional[Part2Topic] = None

#     # ------------------------------------------------------------------ #
#     #  Internal helpers
#     # ------------------------------------------------------------------ #

#     def _history_for_llm(self) -> List[dict]:
#         """LangChain-style messages list banana jo Groq API ko denge."""
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages

#     def _call_llm(self, messages: List[dict], temperature: float = 0.7) -> str:
#         """Groq LLM call — direct, no LangChain overhead needed here."""
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=300,
#         )
#         return response.choices[0].message.content.strip()

#     def _add_examiner_msg(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )

#     def _add_candidate_msg(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )

#     def _candidate_responses_only(self) -> str:
#         return "\n\n".join(
#             f"[{m.part.value.upper()}] {m.content}"
#             for m in self.conversation
#             if m.role == "candidate"
#         )

#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )

#     # ------------------------------------------------------------------ #
#     #  Part transitions
#     # ------------------------------------------------------------------ #

#     def _generate_part2_topic(self) -> Part2Topic:
#         """LLM se ek fresh Part 2 cue card generate karo."""
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "You generate IELTS Speaking Part 2 cue cards. "
#                     "Return ONLY valid JSON. No markdown, no extra text. "
#                     'Format: {"title": "Describe a ...", "bullet_points": ["who", "what", "when", "why"]}'
#                 ),
#             },
#             {
#                 "role": "user",
#                 "content": "Generate one IELTS Part 2 cue card topic. Make it a 'Describe a...' topic.",
#             },
#         ]
#         raw = self._call_llm(messages, temperature=0.9)
#         try:
#             data = json.loads(raw)
#             return Part2Topic(**data)
#         except Exception:
#             # Fallback agar JSON parse fail ho
#             return Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "why it was memorable",
#                 ],
#             )

#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
#         self.part2_topic = self._generate_part2_topic()

#         bullets = "\n".join(
#             f"• {bp}" for bp in self.part2_topic.bullet_points
#         )
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'd like you to talk about the following topic. "
#             f"You have one minute to prepare. You may make notes if you wish.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare."
#         )
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )

#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0

#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"The candidate just finished their Part 2 talk about: "
#                     f"{self.part2_topic.title}. "
#                     "Transition naturally to Part 3. "
#                     "Say a brief thank you then ask your first abstract Part 3 question. "
#                     "One sentence transition + one question only."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#             question_number=self.question_counts["part3"],
#         )

#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )

#     # ------------------------------------------------------------------ #
#     #  Public API
#     # ------------------------------------------------------------------ #

#     def get_opening(self) -> AgentResponse:
#         """
#         Test start karo — examiner ka pehla message.
#         Call this once when test begins.
#         """
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate warmly, introduce yourself as the examiner, "
#                     "confirm their name, then ask the first Part 1 question about "
#                     "whether they work or are a student. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#             question_number=1,
#         )

#     def respond(self, candidate_text: str) -> AgentResponse:
#         """
#         Candidate ka response receive karo, next examiner message return karo.
#         Ye function har baar call hoga jab user kuch bolta hai.
#         """
#         # Candidate ka response save karo
#         self._add_candidate_msg(candidate_text)
#         self.question_counts[self.current_part.value] = (
#             self.question_counts.get(self.current_part.value, 0) + 1
#         )

#         q = self.question_counts

#         # --- Part transition logic ---
#         # Part 1: 4 questions ke baad Part 2 pe jao
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 4:
#             return self._transition_to_part2()

#         # Part 2: candidate ne bolna khatam kiya (1 follow-up ke baad Part 3)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()

#         # Part 3: 4 questions ke baad test khatam
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 4:
#             return self._end_test()

#         # --- Same part mein next question ---
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"Current part: {self.current_part.value}. "
#                     f"Questions asked so far in this part: {self.question_counts[self.current_part.value]}. "
#                     "Generate the next examiner question. "
#                     "One short question only. Do not give feedback."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)

#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#             question_number=self.question_counts[self.current_part.value],
#         )

#     def evaluate(self) -> SpeakingResult:
#         """
#         Poora test khatam hone ke baad call karo.
#         Full transcript ke against evaluation karo.
#         """
#         transcript = self._full_transcript()

#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:

# {transcript}

# Return ONLY this JSON structure (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote from transcript", "another quote"],
#         "improvements": ["specific tip", "specific tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real test, this would be evaluated by a certified examiner listening to your speech.",
#         "examples": [],
#         "improvements": ["Record yourself and listen back", "Practice word stress and intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary"
# }}""",
#             },
#         ]

#         groq_eval = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = groq_eval.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()

#         # JSON parse karo — LLM kabhi kabhi markdown fence add karta hai
#         raw = raw.replace("```json", "").replace("```", "").strip()

#         try:
#             data = json.loads(raw)
#         except json.JSONDecodeError:
#             # Last resort: regex se JSON extract karo
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group())

#         # CriterionScore objects banana
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )




















# import json
# import os
# from typing import List, Optional
# from groq import Groq
# from dotenv import load_dotenv
 
# load_dotenv()
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT
 
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
 
# LLM_MODEL = "llama-3.3-70b-versatile"
 
 
# class SpeakingAgent:
#     """
#     IELTS examiner agent.
#     Ek session ke liye ek instance.
#     Conversation history khud track karta hai.
#     """
 
#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
#         self.part2_topic: Optional[Part2Topic] = None
 
#     # ------------------------------------------------------------------ #
#     #  Internal helpers
#     # ------------------------------------------------------------------ #
 
#     def _history_for_llm(self) -> List[dict]:
#         """LangChain-style messages list banana jo Groq API ko denge."""
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages
 
#     def _call_llm(self, messages: List[dict], temperature: float = 0.7) -> str:
#         """Groq LLM call — direct, no LangChain overhead needed here."""
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=300,
#         )
#         return response.choices[0].message.content.strip()
 
#     def _add_examiner_msg(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )
 
#     def _add_candidate_msg(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )
 
#     def _candidate_responses_only(self) -> str:
#         return "\n\n".join(
#             f"[{m.part.value.upper()}] {m.content}"
#             for m in self.conversation
#             if m.role == "candidate"
#         )
 
#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )
 
#     # ------------------------------------------------------------------ #
#     #  Part transitions
#     # ------------------------------------------------------------------ #
 
#     def _generate_part2_topic(self) -> Part2Topic:
#         """LLM se ek fresh Part 2 cue card generate karo."""
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "You generate IELTS Speaking Part 2 cue cards. "
#                     "Return ONLY valid JSON. No markdown, no extra text. "
#                     'Format: {"title": "Describe a ...", "bullet_points": ["who", "what", "when", "why"]}'
#                 ),
#             },
#             {
#                 "role": "user",
#                 "content": "Generate one IELTS Part 2 cue card topic. Make it a 'Describe a...' topic.",
#             },
#         ]
#         raw = self._call_llm(messages, temperature=0.9)
#         try:
#             data = json.loads(raw)
#             return Part2Topic(**data)
#         except Exception:
#             # Fallback agar JSON parse fail ho
#             return Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "why it was memorable",
#                 ],
#             )
 
#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
#         self.part2_topic = self._generate_part2_topic()
 
#         bullets = "\n".join(
#             f"• {bp}" for bp in self.part2_topic.bullet_points
#         )
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'd like you to talk about the following topic. "
#             f"You have one minute to prepare. You may make notes if you wish.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare."
#         )
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )
 
#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0
 
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"The candidate just finished their Part 2 talk about: "
#                     f"{self.part2_topic.title}. "
#                     "Transition naturally to Part 3. "
#                     "Say a brief thank you then ask your first abstract Part 3 question. "
#                     "One sentence transition + one question only."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#             question_number=self.question_counts["part3"],
#         )
 
#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )
 
#     # ------------------------------------------------------------------ #
#     #  Public API
#     # ------------------------------------------------------------------ #
 
#     def get_opening(self) -> AgentResponse:
#         """
#         Test start karo — examiner ka pehla message.
#         Call this once when test begins.
#         """
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate warmly, introduce yourself as the examiner, "
#                     "confirm their name, then ask the first Part 1 question about "
#                     "whether they work or are a student. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#             question_number=1,
#         )
 
#     def respond(self, candidate_text: str) -> AgentResponse:
#         """
#         Candidate ka response receive karo, next examiner message return karo.
#         Ye function har baar call hoga jab user kuch bolta hai.
#         """
#         # Candidate ka response save karo
#         self._add_candidate_msg(candidate_text)
#         self.question_counts[self.current_part.value] = (
#             self.question_counts.get(self.current_part.value, 0) + 1
#         )
 
#         q = self.question_counts
 
#         # --- Part transition logic ---
#         # Part 1: 4 questions ke baad Part 2 pe jao
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 4:
#             return self._transition_to_part2()
 
#         # Part 2: candidate ne bolna khatam kiya (1 follow-up ke baad Part 3)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()
 
#         # Part 3: 4 questions ke baad test khatam
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 4:
#             return self._end_test()
 
#         # --- Same part mein next question ---
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"Current part: {self.current_part.value}. "
#                     f"Questions asked so far in this part: {self.question_counts[self.current_part.value]}. "
#                     "Generate the next examiner question. "
#                     "One short question only. Do not give feedback."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
 
#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#             question_number=self.question_counts[self.current_part.value],
#         )
 
#     def evaluate(self) -> SpeakingResult:
#         """
#         Poora test khatam hone ke baad call karo.
#         Full transcript ke against evaluation karo.
#         """
#         transcript = self._full_transcript()
 
#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:
 
# {transcript}
 
# Return ONLY this JSON structure (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote from transcript", "another quote"],
#         "improvements": ["specific tip", "specific tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real test, this would be evaluated by a certified examiner listening to your speech.",
#         "examples": [],
#         "improvements": ["Record yourself and listen back", "Practice word stress and intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary"
# }}""",
#             },
#         ]
 
#         groq_eval = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = groq_eval.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()
 
#         # JSON parse karo — LLM kabhi kabhi markdown fence add karta hai
#         raw = raw.replace("```json", "").replace("```", "").strip()
 
#         try:
#             data = json.loads(raw)
#         except json.JSONDecodeError:
#             # Last resort: regex se JSON extract karo
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group())
 
#         # CriterionScore objects banana
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )


















# import json
# import os
# import random
# from typing import List, Optional
# from groq import Groq
# from dotenv import load_dotenv
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT
 
# load_dotenv()
 
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# LLM_MODEL = "llama-3.3-70b-versatile"
 
 
# class SpeakingAgent:
#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.part2_topic: Optional[Part2Topic] = None
 
#         # Official IELTS question counts per part:
#         # Part 1: ~10 questions (3 topics x 3-4 questions)
#         # Part 2: 2 (main talk + 1-2 follow-up)
#         # Part 3: 5-6 questions
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
 
#     def _history_for_llm(self) -> List[dict]:
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages
 
#     def _call_llm(self, messages: List[dict], temperature: float = 0.7,
#                   max_tokens: int = 300) -> str:
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=max_tokens,
#         )
#         return response.choices[0].message.content.strip()
 
#     def _add_examiner(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )
 
#     def _add_candidate(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )
 
#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )
 
#     # ── Part transitions ──────────────────────────────────────────────────────
 
#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
 
#         # LLM se fresh cue card generate karo
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "Generate one IELTS Speaking Part 2 cue card. "
#                     "Must be a 'Describe a...' or 'Talk about a...' topic. "
#                     "Must relate to real personal experiences. "
#                     "Return ONLY valid JSON, no markdown:\n"
#                     '{"title": "Describe a ...", "bullet_points": ["point1", "point2", "point3", "point4"]}'
#                 ),
#             },
#             {"role": "user", "content": "Generate a Part 2 cue card topic."},
#         ]
#         raw = self._call_llm(messages, temperature=0.9, max_tokens=200)
#         try:
#             raw = raw.replace("```json", "").replace("```", "").strip()
#             data = json.loads(raw)
#             self.part2_topic = Part2Topic(**data)
#         except Exception:
#             self.part2_topic = Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "and explain why it was memorable",
#                 ],
#             )
 
#         bullets = "\n".join(f"• {bp}" for bp in self.part2_topic.bullet_points)
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'm going to give you a topic and I'd like you to talk about it "
#             f"for one to two minutes. You have one minute to prepare.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare. You may make notes if you wish."
#         )
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )
 
#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0
 
#         messages = self._history_for_llm()
#         messages.append({
#             "role": "user",
#             "content": (
#                 f"The candidate just finished their Part 2 talk about: '{self.part2_topic.title}'. "
#                 "Now transition to Part 3. "
#                 "Say a brief thank you (1 sentence), then ask your FIRST Part 3 question. "
#                 "The question must be ABSTRACT and SOCIETAL — not personal. "
#                 "Use TYPE 1 (Opinion) or TYPE 3 (Cause/Effect) for the first question. "
#                 "One question only."
#             ),
#         })
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#         )
 
#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )
 
#     # ── Public API ────────────────────────────────────────────────────────────
 
#     def get_opening(self) -> AgentResponse:
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate, introduce yourself as the examiner. "
#                     "Then begin Part 1 STEP 1: ask your first warm-up question "
#                     "about Work or Studies. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#         )
 
#     def respond(self, candidate_text: str) -> AgentResponse:
#         self._add_candidate(candidate_text)
#         q = self.question_counts
#         q[self.current_part.value] = q.get(self.current_part.value, 0) + 1
 
#         # ── Part transition thresholds (official IELTS) ──
#         # Part 1: 10 questions (~3 topics x 3-4 each)
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 10:
#             return self._transition_to_part2()
 
#         # Part 2: 2 turns (main talk + 1 follow-up)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()
 
#         # Part 3: 5-6 questions
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 6:
#             return self._end_test()
 
#         # ── Generate next examiner question ──
#         messages = self._history_for_llm()
 
#         if self.current_part == SpeakingPart.PART1:
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     f"Part 1 — question {q['part1']} asked so far. "
#                     "Follow the 3-step structure from your instructions. "
#                     "Ask the next natural Part 1 question. "
#                     "If you have asked 3-4 questions on current topic, move to next topic. "
#                     "One short question only. Do not give feedback."
#                 ),
#             })
#         elif self.current_part == SpeakingPart.PART2:
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     "The candidate has finished their Part 2 talk. "
#                     "Ask ONE brief follow-up question related to what they said. "
#                     "Keep it very short and natural."
#                 ),
#             })
#         elif self.current_part == SpeakingPart.PART3:
#             # Vary question types across Part 3
#             type_map = {
#                 1: "OPINION",
#                 2: "COMPARISON",
#                 3: "CAUSE/EFFECT",
#                 4: "PROBLEM/SOLUTION",
#                 5: "SPECULATION/FUTURE",
#                 6: "OPINION",  # Final wrap-up opinion question
#             }
#             q_num = q["part3"]
#             q_type = type_map.get(q_num, "OPINION")
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     f"Part 3 — question {q_num}. "
#                     f"Use question TYPE: {q_type}. "
#                     "The question must be ABSTRACT and SOCIETAL — not personal. "
#                     f"Must be linked to the Part 2 topic: '{self.part2_topic.title}'. "
#                     "One question only. Do not give feedback."
#                 ),
#             })
 
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#         )
 
#     def evaluate(self) -> SpeakingResult:
#         transcript = self._full_transcript()
 
#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:
 
# {transcript}
 
# Return ONLY this JSON (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote from transcript", "another actual quote"],
#         "improvements": ["specific actionable tip", "another tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote showing vocabulary use"],
#         "improvements": ["specific tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote showing grammar"],
#         "improvements": ["specific tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real IELTS test, this criterion is evaluated by the examiner listening to your actual speech.",
#         "examples": [],
#         "improvements": ["Record yourself and compare with native speakers", "Focus on word stress and sentence intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary with main strength and main area to improve"
# }}""",
#             },
#         ]
 
#         eval_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = eval_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()
#         raw = raw.replace("```json", "").replace("```", "").strip()
 
#         try:
#             data = json.loads(raw)
#         except json.JSONDecodeError:
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group())
 
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )





































# import json
# import os
# from typing import List, Optional
# from groq import Groq
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT

# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# LLM_MODEL = "llama-3.3-70b-versatile"


# class SpeakingAgent:
#     """
#     IELTS examiner agent.
#     Ek session ke liye ek instance.
#     Conversation history khud track karta hai.
#     """

#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
#         self.part2_topic: Optional[Part2Topic] = None

#     # ------------------------------------------------------------------ #
#     #  Internal helpers
#     # ------------------------------------------------------------------ #

#     def _history_for_llm(self) -> List[dict]:
#         """LangChain-style messages list banana jo Groq API ko denge."""
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages

#     def _call_llm(self, messages: List[dict], temperature: float = 0.7) -> str:
#         """Groq LLM call — direct, no LangChain overhead needed here."""
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=300,
#         )
#         return response.choices[0].message.content.strip()

#     def _add_examiner_msg(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )

#     def _add_candidate_msg(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )

#     def _candidate_responses_only(self) -> str:
#         return "\n\n".join(
#             f"[{m.part.value.upper()}] {m.content}"
#             for m in self.conversation
#             if m.role == "candidate"
#         )

#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )

#     # ------------------------------------------------------------------ #
#     #  Part transitions
#     # ------------------------------------------------------------------ #

#     def _generate_part2_topic(self) -> Part2Topic:
#         """LLM se ek fresh Part 2 cue card generate karo."""
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "You generate IELTS Speaking Part 2 cue cards. "
#                     "Return ONLY valid JSON. No markdown, no extra text. "
#                     'Format: {"title": "Describe a ...", "bullet_points": ["who", "what", "when", "why"]}'
#                 ),
#             },
#             {
#                 "role": "user",
#                 "content": "Generate one IELTS Part 2 cue card topic. Make it a 'Describe a...' topic.",
#             },
#         ]
#         raw = self._call_llm(messages, temperature=0.9)
#         try:
#             data = json.loads(raw)
#             return Part2Topic(**data)
#         except Exception:
#             # Fallback agar JSON parse fail ho
#             return Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "why it was memorable",
#                 ],
#             )

#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
#         self.part2_topic = self._generate_part2_topic()

#         bullets = "\n".join(
#             f"• {bp}" for bp in self.part2_topic.bullet_points
#         )
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'd like you to talk about the following topic. "
#             f"You have one minute to prepare. You may make notes if you wish.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare."
#         )
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )

#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0

#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"The candidate just finished their Part 2 talk about: "
#                     f"{self.part2_topic.title}. "
#                     "Transition naturally to Part 3. "
#                     "Say a brief thank you then ask your first abstract Part 3 question. "
#                     "One sentence transition + one question only."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#             question_number=self.question_counts["part3"],
#         )

#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )

#     # ------------------------------------------------------------------ #
#     #  Public API
#     # ------------------------------------------------------------------ #

#     def get_opening(self) -> AgentResponse:
#         """
#         Test start karo — examiner ka pehla message.
#         Call this once when test begins.
#         """
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate warmly, introduce yourself as the examiner, "
#                     "confirm their name, then ask the first Part 1 question about "
#                     "whether they work or are a student. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#             question_number=1,
#         )

#     def respond(self, candidate_text: str) -> AgentResponse:
#         """
#         Candidate ka response receive karo, next examiner message return karo.
#         Ye function har baar call hoga jab user kuch bolta hai.
#         """
#         # Candidate ka response save karo
#         self._add_candidate_msg(candidate_text)
#         self.question_counts[self.current_part.value] = (
#             self.question_counts.get(self.current_part.value, 0) + 1
#         )

#         q = self.question_counts

#         # --- Part transition logic ---
#         # Part 1: 4 questions ke baad Part 2 pe jao
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 4:
#             return self._transition_to_part2()

#         # Part 2: candidate ne bolna khatam kiya (1 follow-up ke baad Part 3)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()

#         # Part 3: 4 questions ke baad test khatam
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 4:
#             return self._end_test()

#         # --- Same part mein next question ---
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"Current part: {self.current_part.value}. "
#                     f"Questions asked so far in this part: {self.question_counts[self.current_part.value]}. "
#                     "Generate the next examiner question. "
#                     "One short question only. Do not give feedback."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)

#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#             question_number=self.question_counts[self.current_part.value],
#         )

#     def evaluate(self) -> SpeakingResult:
#         """
#         Poora test khatam hone ke baad call karo.
#         Full transcript ke against evaluation karo.
#         """
#         transcript = self._full_transcript()

#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:

# {transcript}

# Return ONLY this JSON structure (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote from transcript", "another quote"],
#         "improvements": ["specific tip", "specific tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real test, this would be evaluated by a certified examiner listening to your speech.",
#         "examples": [],
#         "improvements": ["Record yourself and listen back", "Practice word stress and intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary"
# }}""",
#             },
#         ]

#         groq_eval = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = groq_eval.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()

#         # JSON parse karo — LLM kabhi kabhi markdown fence add karta hai
#         raw = raw.replace("```json", "").replace("```", "").strip()

#         try:
#             data = json.loads(raw)
#         except json.JSONDecodeError:
#             # Last resort: regex se JSON extract karo
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group())

#         # CriterionScore objects banana
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )




















# import json
# import os
# from typing import List, Optional
# from groq import Groq
# from dotenv import load_dotenv
 
# load_dotenv()
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT
 
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
 
# LLM_MODEL = "llama-3.3-70b-versatile"
 
 
# class SpeakingAgent:
#     """
#     IELTS examiner agent.
#     Ek session ke liye ek instance.
#     Conversation history khud track karta hai.
#     """
 
#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
#         self.part2_topic: Optional[Part2Topic] = None
 
#     # ------------------------------------------------------------------ #
#     #  Internal helpers
#     # ------------------------------------------------------------------ #
 
#     def _history_for_llm(self) -> List[dict]:
#         """LangChain-style messages list banana jo Groq API ko denge."""
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages
 
#     def _call_llm(self, messages: List[dict], temperature: float = 0.7) -> str:
#         """Groq LLM call — direct, no LangChain overhead needed here."""
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=300,
#         )
#         return response.choices[0].message.content.strip()
 
#     def _add_examiner_msg(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )
 
#     def _add_candidate_msg(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )
 
#     def _candidate_responses_only(self) -> str:
#         return "\n\n".join(
#             f"[{m.part.value.upper()}] {m.content}"
#             for m in self.conversation
#             if m.role == "candidate"
#         )
 
#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )
 
#     # ------------------------------------------------------------------ #
#     #  Part transitions
#     # ------------------------------------------------------------------ #
 
#     def _generate_part2_topic(self) -> Part2Topic:
#         """LLM se ek fresh Part 2 cue card generate karo."""
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "You generate IELTS Speaking Part 2 cue cards. "
#                     "Return ONLY valid JSON. No markdown, no extra text. "
#                     'Format: {"title": "Describe a ...", "bullet_points": ["who", "what", "when", "why"]}'
#                 ),
#             },
#             {
#                 "role": "user",
#                 "content": "Generate one IELTS Part 2 cue card topic. Make it a 'Describe a...' topic.",
#             },
#         ]
#         raw = self._call_llm(messages, temperature=0.9)
#         try:
#             data = json.loads(raw)
#             return Part2Topic(**data)
#         except Exception:
#             # Fallback agar JSON parse fail ho
#             return Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "why it was memorable",
#                 ],
#             )
 
#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
#         self.part2_topic = self._generate_part2_topic()
 
#         bullets = "\n".join(
#             f"• {bp}" for bp in self.part2_topic.bullet_points
#         )
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'd like you to talk about the following topic. "
#             f"You have one minute to prepare. You may make notes if you wish.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare."
#         )
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )
 
#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0
 
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"The candidate just finished their Part 2 talk about: "
#                     f"{self.part2_topic.title}. "
#                     "Transition naturally to Part 3. "
#                     "Say a brief thank you then ask your first abstract Part 3 question. "
#                     "One sentence transition + one question only."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#             question_number=self.question_counts["part3"],
#         )
 
#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )
 
#     # ------------------------------------------------------------------ #
#     #  Public API
#     # ------------------------------------------------------------------ #
 
#     def get_opening(self) -> AgentResponse:
#         """
#         Test start karo — examiner ka pehla message.
#         Call this once when test begins.
#         """
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate warmly, introduce yourself as the examiner, "
#                     "confirm their name, then ask the first Part 1 question about "
#                     "whether they work or are a student. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#             question_number=1,
#         )
 
#     def respond(self, candidate_text: str) -> AgentResponse:
#         """
#         Candidate ka response receive karo, next examiner message return karo.
#         Ye function har baar call hoga jab user kuch bolta hai.
#         """
#         # Candidate ka response save karo
#         self._add_candidate_msg(candidate_text)
#         self.question_counts[self.current_part.value] = (
#             self.question_counts.get(self.current_part.value, 0) + 1
#         )
 
#         q = self.question_counts
 
#         # --- Part transition logic ---
#         # Part 1: 4 questions ke baad Part 2 pe jao
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 4:
#             return self._transition_to_part2()
 
#         # Part 2: candidate ne bolna khatam kiya (1 follow-up ke baad Part 3)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()
 
#         # Part 3: 4 questions ke baad test khatam
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 4:
#             return self._end_test()
 
#         # --- Same part mein next question ---
#         messages = self._history_for_llm()
#         messages.append(
#             {
#                 "role": "user",
#                 "content": (
#                     f"Current part: {self.current_part.value}. "
#                     f"Questions asked so far in this part: {self.question_counts[self.current_part.value]}. "
#                     "Generate the next examiner question. "
#                     "One short question only. Do not give feedback."
#                 ),
#             }
#         )
#         text = self._call_llm(messages)
#         self._add_examiner_msg(text)
 
#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#             question_number=self.question_counts[self.current_part.value],
#         )
 
#     def evaluate(self) -> SpeakingResult:
#         """
#         Poora test khatam hone ke baad call karo.
#         Full transcript ke against evaluation karo.
#         """
#         transcript = self._full_transcript()
 
#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:
 
# {transcript}
 
# Return ONLY this JSON structure (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote from transcript", "another quote"],
#         "improvements": ["specific tip", "specific tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence assessment",
#         "examples": ["actual quote", "another quote"],
#         "improvements": ["tip", "tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real test, this would be evaluated by a certified examiner listening to your speech.",
#         "examples": [],
#         "improvements": ["Record yourself and listen back", "Practice word stress and intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary"
# }}""",
#             },
#         ]
 
#         groq_eval = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = groq_eval.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()
 
#         # JSON parse karo — LLM kabhi kabhi markdown fence add karta hai
#         raw = raw.replace("```json", "").replace("```", "").strip()
 
#         try:
#             data = json.loads(raw)
#         except json.JSONDecodeError:
#             # Last resort: regex se JSON extract karo
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group())
 
#         # CriterionScore objects banana
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )


















# import json
# import os
# import random
# from typing import List, Optional
# from groq import Groq
# from dotenv import load_dotenv
# from schemas.speaking_schema import (
#     Message, SpeakingPart, AgentResponse,
#     Part2Topic, CriterionScore, SpeakingResult
# )
# from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT
 
# load_dotenv()
 
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
# LLM_MODEL = "llama-3.3-70b-versatile"
 
 
# class SpeakingAgent:
#     def __init__(self):
#         self.conversation: List[Message] = []
#         self.current_part = SpeakingPart.PART1
#         self.part2_topic: Optional[Part2Topic] = None
 
#         # Official IELTS question counts per part:
#         # Part 1: ~10 questions (3 topics x 3-4 questions)
#         # Part 2: 2 (main talk + 1-2 follow-up)
#         # Part 3: 5-6 questions
#         self.question_counts = {"part1": 0, "part2": 0, "part3": 0}
 
#     def _history_for_llm(self) -> List[dict]:
#         messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
#         for msg in self.conversation:
#             role = "assistant" if msg.role == "examiner" else "user"
#             messages.append({"role": role, "content": msg.content})
#         return messages
 
#     def _call_llm(self, messages: List[dict], temperature: float = 0.7,
#                   max_tokens: int = 300) -> str:
#         response = groq_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=messages,
#             temperature=temperature,
#             max_tokens=max_tokens,
#         )
#         return response.choices[0].message.content.strip()
 
#     def _add_examiner(self, text: str):
#         self.conversation.append(
#             Message(role="examiner", content=text, part=self.current_part)
#         )
 
#     def _add_candidate(self, text: str):
#         self.conversation.append(
#             Message(role="candidate", content=text, part=self.current_part)
#         )
 
#     def _full_transcript(self) -> str:
#         return "\n".join(
#             f"{m.role.upper()} ({m.part.value}): {m.content}"
#             for m in self.conversation
#         )
 
#     # ── Part transitions ──────────────────────────────────────────────────────
 
#     def _transition_to_part2(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART2
#         self.question_counts["part2"] = 0
 
#         # LLM se fresh cue card generate karo
#         messages = [
#             {
#                 "role": "system",
#                 "content": (
#                     "Generate one IELTS Speaking Part 2 cue card. "
#                     "Must be a 'Describe a...' or 'Talk about a...' topic. "
#                     "Must relate to real personal experiences. "
#                     "Return ONLY valid JSON, no markdown:\n"
#                     '{"title": "Describe a ...", "bullet_points": ["point1", "point2", "point3", "point4"]}'
#                 ),
#             },
#             {"role": "user", "content": "Generate a Part 2 cue card topic."},
#         ]
#         raw = self._call_llm(messages, temperature=0.9, max_tokens=200)
#         try:
#             raw = raw.replace("```json", "").replace("```", "").strip()
#             data = json.loads(raw, strict=False)
#             self.part2_topic = Part2Topic(**data)
#         except Exception:
#             self.part2_topic = Part2Topic(
#                 title="Describe a memorable journey you have taken",
#                 bullet_points=[
#                     "where you went",
#                     "who you went with",
#                     "what you did there",
#                     "and explain why it was memorable",
#                 ],
#             )
 
#         bullets = "\n".join(f"• {bp}" for bp in self.part2_topic.bullet_points)
#         text = (
#             f"Thank you. Now we'll move on to Part 2.\n\n"
#             f"I'm going to give you a topic and I'd like you to talk about it "
#             f"for one to two minutes. You have one minute to prepare.\n\n"
#             f"Topic: {self.part2_topic.title}\n\n"
#             f"You should say:\n{bullets}\n\n"
#             f"You have one minute to prepare. You may make notes if you wish."
#         )
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART2,
#             part2_topic=self.part2_topic,
#         )
 
#     def _transition_to_part3(self) -> AgentResponse:
#         self.current_part = SpeakingPart.PART3
#         self.question_counts["part3"] = 0
 
#         messages = self._history_for_llm()
#         messages.append({
#             "role": "user",
#             "content": (
#                 f"The candidate just finished their Part 2 talk about: '{self.part2_topic.title}'. "
#                 "Now transition to Part 3. "
#                 "Say a brief thank you (1 sentence), then ask your FIRST Part 3 question. "
#                 "The question must be ABSTRACT and SOCIETAL — not personal. "
#                 "Use TYPE 1 (Opinion) or TYPE 3 (Cause/Effect) for the first question. "
#                 "One question only."
#             ),
#         })
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART3,
#         )
 
#     def _end_test(self) -> AgentResponse:
#         self.current_part = SpeakingPart.COMPLETED
#         text = "That's the end of the speaking test. Thank you very much."
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.COMPLETED,
#             test_complete=True,
#         )
 
#     # ── Public API ────────────────────────────────────────────────────────────
 
#     def get_opening(self) -> AgentResponse:
#         messages = [
#             {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": (
#                     "Start the IELTS Speaking test. "
#                     "Greet the candidate, introduce yourself as the examiner. "
#                     "Then begin Part 1 STEP 1: ask your first warm-up question "
#                     "about Work or Studies. Keep it natural and brief."
#                 ),
#             },
#         ]
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=SpeakingPart.PART1,
#         )
 
#     def respond(self, candidate_text: str) -> AgentResponse:
#         self._add_candidate(candidate_text)
#         q = self.question_counts
#         q[self.current_part.value] = q.get(self.current_part.value, 0) + 1
 
#         # ── Part transition thresholds (official IELTS) ──
#         # Part 1: 10 questions (~3 topics x 3-4 each)
#         if self.current_part == SpeakingPart.PART1 and q["part1"] >= 10:
#             return self._transition_to_part2()
 
#         # Part 2: 2 turns (main talk + 1 follow-up)
#         if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
#             return self._transition_to_part3()
 
#         # Part 3: 5-6 questions
#         if self.current_part == SpeakingPart.PART3 and q["part3"] >= 6:
#             return self._end_test()
 
#         # ── Generate next examiner question ──
#         messages = self._history_for_llm()
 
#         if self.current_part == SpeakingPart.PART1:
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     f"Part 1 — question {q['part1']} asked so far. "
#                     "Follow the 3-step structure from your instructions. "
#                     "Ask the next natural Part 1 question. "
#                     "If you have asked 3-4 questions on current topic, move to next topic. "
#                     "One short question only. Do not give feedback."
#                 ),
#             })
#         elif self.current_part == SpeakingPart.PART2:
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     "The candidate has finished their Part 2 talk. "
#                     "Ask ONE brief follow-up question related to what they said. "
#                     "Keep it very short and natural."
#                 ),
#             })
#         elif self.current_part == SpeakingPart.PART3:
#             # Vary question types across Part 3
#             type_map = {
#                 1: "OPINION",
#                 2: "COMPARISON",
#                 3: "CAUSE/EFFECT",
#                 4: "PROBLEM/SOLUTION",
#                 5: "SPECULATION/FUTURE",
#                 6: "OPINION",  # Final wrap-up opinion question
#             }
#             q_num = q["part3"]
#             q_type = type_map.get(q_num, "OPINION")
#             messages.append({
#                 "role": "user",
#                 "content": (
#                     f"Part 3 — question {q_num}. "
#                     f"Use question TYPE: {q_type}. "
#                     "The question must be ABSTRACT and SOCIETAL — not personal. "
#                     f"Must be linked to the Part 2 topic: '{self.part2_topic.title}'. "
#                     "One question only. Do not give feedback."
#                 ),
#             })
 
#         text = self._call_llm(messages)
#         self._add_examiner(text)
#         return AgentResponse(
#             examiner_text=text,
#             current_part=self.current_part,
#         )
 
#     def evaluate(self) -> SpeakingResult:
#         transcript = self._full_transcript()
 
#         eval_messages = [
#             {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
#             {
#                 "role": "user",
#                 "content": f"""Evaluate this IELTS Speaking test transcript:
 
# {transcript}
 
# Return ONLY this JSON (no markdown, no extra text):
# {{
#     "fluency_coherence": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote from transcript", "another actual quote"],
#         "improvements": ["specific actionable tip", "another tip"]
#     }},
#     "lexical_resource": {{
#         "band": 6.0,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote showing vocabulary use"],
#         "improvements": ["specific tip"]
#     }},
#     "grammatical_range": {{
#         "band": 6.5,
#         "feedback": "2-3 sentence honest assessment",
#         "examples": ["actual quote showing grammar"],
#         "improvements": ["specific tip"]
#     }},
#     "pronunciation": {{
#         "band": 6.0,
#         "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real IELTS test, this criterion is evaluated by the examiner listening to your actual speech.",
#         "examples": [],
#         "improvements": ["Record yourself and compare with native speakers", "Focus on word stress and sentence intonation"]
#     }},
#     "overall_band": 6.5,
#     "general_feedback": "2-3 sentence overall summary with main strength and main area to improve"
# }}""",
#             },
#         ]
 
#         eval_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
#         response = eval_client.chat.completions.create(
#             model=LLM_MODEL,
#             messages=eval_messages,
#             temperature=0.1,
#             max_tokens=1500,
#         )
#         raw = response.choices[0].message.content.strip()
#         raw = raw.replace("```json", "").replace("```", "").strip()
 
#         try:
#             data = json.loads(raw, strict=False)
#         except json.JSONDecodeError:
#             import re
#             match = re.search(r"\{.*\}", raw, re.DOTALL)
#             data = json.loads(match.group(), strict=False)
 
#         return SpeakingResult(
#             fluency_coherence=CriterionScore(**data["fluency_coherence"]),
#             lexical_resource=CriterionScore(**data["lexical_resource"]),
#             grammatical_range=CriterionScore(**data["grammatical_range"]),
#             pronunciation=CriterionScore(**data["pronunciation"]),
#             overall_band=data["overall_band"],
#             general_feedback=data["general_feedback"],
#         )



































# agents/speaking_agent.py
# IELTS Speaking Examiner Agent — raw Groq SDK (sync calls, run via
# asyncio.to_thread from routes/speaking_ws.py so the event loop never blocks).

import json
import re
import time
from typing import List, Optional
from loguru import logger

from groq import Groq

from core.config import settings
from schemas.speaking_schema import (
    Message, SpeakingPart, AgentResponse,
    Part2Topic, CriterionScore, SpeakingResult,
)
from prompts.speaking_prompts import EXAMINER_SYSTEM_PROMPT, EVALUATOR_SYSTEM_PROMPT

from core.dynamic_settings import get_raw_groq_client, get_llm_model

# Placeholder fed into the conversation when the candidate gave no answer
# within the silence timeout — kept distinct from a real (possibly short)
# answer so it's easy to recognize in transcripts/logs.
NO_ANSWER_PLACEHOLDER = "(No response — candidate remained silent)"

_RATE_LIMIT_MARKERS = ("rate limit", "rate_limit", "429", "quota", "too many requests")
_MAX_LLM_RETRIES = 3
_RETRY_BACKOFF_SECONDS = (2, 4, 8)


class RateLimitExceededError(Exception):
    """Raised when Groq's rate limit persists after retries. Caught in
    routes/speaking_ws.py to send a clear 'high demand, try again' message
    instead of the session just silently stalling."""
    pass


class SpeakingAgent:
    """
    One instance per active speaking-test session (in-memory — see
    routes/speaking_ws.py's active_sessions dict). Tracks conversation
    history and drives the Part 1 → 2 → 3 → evaluate() state machine.
    """

    def __init__(self):
        self.conversation: List[Message] = []
        self.current_part = SpeakingPart.PART1
        self.part2_topic: Optional[Part2Topic] = None

        # Official IELTS question counts per part:
        # Part 1: ~10 questions (3 topics x 3-4 questions)
        # Part 2: 2 (main talk + 1 follow-up)
        # Part 3: 5-6 questions
        self.question_counts = {"part1": 0, "part2": 0, "part3": 0}

    # ── Internal helpers ────────────────────────────────────────────

    def _history_for_llm(self) -> List[dict]:
        messages = [{"role": "system", "content": EXAMINER_SYSTEM_PROMPT}]
        for msg in self.conversation:
            role = "assistant" if msg.role == "examiner" else "user"
            messages.append({"role": role, "content": msg.content})
        return messages

    # def _call_llm(self, messages: List[dict], temperature: float = 0.7,
    #               max_tokens: int = 300) -> str:
    #     """Sync Groq call with retry + backoff on transient rate limits.
    #     Safe to block here — this always runs inside asyncio.to_thread()."""
    #     last_error: Optional[Exception] = None
    #     client = get_raw_groq_client()
    #     model_name = get_llm_model()

    #     for attempt in range(_MAX_LLM_RETRIES):
    #         try:
    #             response = client.chat.completions.create(
    #                 model=model_name,
    #                 messages=messages,
    #                 temperature=temperature,
    #                 max_tokens=max_tokens,
    #             )
    #             return response.choices[0].message.content.strip()

    #         except Exception as e:
    #             last_error = e
    #             is_rate_limit = any(marker in str(e).lower() for marker in _RATE_LIMIT_MARKERS)

    #             if not is_rate_limit:
    #                 logger.error(f"Speaking LLM call failed (non-rate-limit): {e}")
    #                 raise

    #             if attempt < _MAX_LLM_RETRIES - 1:
    #                 wait = _RETRY_BACKOFF_SECONDS[attempt]
    #                 logger.warning(
    #                     f"Groq rate limit hit (attempt {attempt + 1}/{_MAX_LLM_RETRIES}), "
    #                     f"retrying in {wait}s..."
    #                 )
    #                 time.sleep(wait)
    #             else:
    #                 logger.error(f"Groq rate limit persisted after {_MAX_LLM_RETRIES} attempts: {e}")

    #     raise RateLimitExceededError(
    #         "Our AI examiner is experiencing high demand right now. "
    #         "Please wait a minute and try again."
    #     ) from last_error
    
    
    def _call_llm(self, messages: List[dict], temperature: float = 0.7,
                  max_tokens: int = 300) -> str:
        """Sync Groq call with retry + backoff on transient rate limits AND
        empty/blank responses. Safe to block here — always runs inside
        asyncio.to_thread()."""
        last_error: Optional[Exception] = None
        client = get_raw_groq_client()
        model_name = get_llm_model()

        for attempt in range(_MAX_LLM_RETRIES):
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )

                content = response.choices[0].message.content
                content = content.strip() if content else ""

                # An empty completion is a transient failure, not a valid
                # examiner turn — sending "" to the client renders a blank
                # question bubble. Retry instead of returning empty.
                if not content:
                    logger.warning(
                        f"LLM returned empty content "
                        f"(attempt {attempt + 1}/{_MAX_LLM_RETRIES}), retrying..."
                    )
                    if attempt < _MAX_LLM_RETRIES - 1:
                        time.sleep(_RETRY_BACKOFF_SECONDS[attempt])
                        continue
                    raise RuntimeError("LLM returned empty content after retries")

                return content

            except Exception as e:
                last_error = e
                is_rate_limit = any(marker in str(e).lower() for marker in _RATE_LIMIT_MARKERS)

                if not is_rate_limit:
                    if isinstance(e, RuntimeError) and "empty content" in str(e):
                        logger.error("LLM produced only empty responses across all retries")
                        raise
                    logger.error(f"Speaking LLM call failed (non-rate-limit): {e}")
                    raise

                if attempt < _MAX_LLM_RETRIES - 1:
                    wait = _RETRY_BACKOFF_SECONDS[attempt]
                    logger.warning(
                        f"Groq rate limit hit (attempt {attempt + 1}/{_MAX_LLM_RETRIES}), "
                        f"retrying in {wait}s..."
                    )
                    time.sleep(wait)
                else:
                    logger.error(f"Groq rate limit persisted after {_MAX_LLM_RETRIES} attempts: {e}")

        raise RateLimitExceededError(
            "Our AI examiner is experiencing high demand right now. "
            "Please wait a minute and try again."
        ) from last_error

    def _add_examiner(self, text: str):
        self.conversation.append(Message(role="examiner", content=text, part=self.current_part))

    def _add_candidate(self, text: str):
        self.conversation.append(Message(role="candidate", content=text, part=self.current_part))

    def _full_transcript(self) -> str:
        return "\n".join(
            f"{m.role.upper()} ({m.part.value}): {m.content}"
            for m in self.conversation
        )

    def _current_question_number(self) -> int:
        return self.question_counts.get(self.current_part.value, 0)

    # ── Part transitions ────────────────────────────────────────────

    def _transition_to_part2(self) -> AgentResponse:
        self.current_part = SpeakingPart.PART2
        self.question_counts["part2"] = 0

        messages = [
            {
                "role": "system",
                "content": (
                    "Generate one IELTS Speaking Part 2 cue card. "
                    "Must be a 'Describe a...' or 'Talk about a...' topic. "
                    "Must relate to real personal experiences. "
                    "Return ONLY valid JSON, no markdown:\n"
                    '{"title": "Describe a ...", "bullet_points": ["point1", "point2", "point3", "point4"]}'
                ),
            },
            {"role": "user", "content": "Generate a Part 2 cue card topic."},
        ]
        raw = self._call_llm(messages, temperature=0.9, max_tokens=200)
        try:
            raw = raw.replace("```json", "").replace("```", "").strip()
            data = json.loads(raw, strict=False)
            self.part2_topic = Part2Topic(**data)
        except Exception as e:
            logger.warning(f"Part 2 topic generation failed, using fallback: {e}")
            self.part2_topic = Part2Topic(
                title="Describe a memorable journey you have taken",
                bullet_points=[
                    "where you went",
                    "who you went with",
                    "what you did there",
                    "and explain why it was memorable",
                ],
            )

        bullets = "\n".join(f"• {bp}" for bp in self.part2_topic.bullet_points)
        text = (
            f"Thank you. Now we'll move on to Part 2.\n\n"
            f"I'm going to give you a topic and I'd like you to talk about it "
            f"for one to two minutes. You have one minute to prepare.\n\n"
            f"Topic: {self.part2_topic.title}\n\n"
            f"You should say:\n{bullets}\n\n"
            f"You have one minute to prepare. You may make notes if you wish."
        )
        self._add_examiner(text)
        return AgentResponse(
            examiner_text=text,
            current_part=SpeakingPart.PART2,
            part2_topic=self.part2_topic,
            question_number=self._current_question_number(),
        )

    def _transition_to_part3(self) -> AgentResponse:
        self.current_part = SpeakingPart.PART3
        self.question_counts["part3"] = 0

        messages = self._history_for_llm()
        messages.append({
            "role": "user",
            "content": (
                f"The candidate just finished their Part 2 talk about: '{self.part2_topic.title}'. "
                "Now transition to Part 3. "
                "Say a brief thank you (1 sentence), then ask your FIRST Part 3 question. "
                "The question must be ABSTRACT and SOCIETAL — not personal. "
                "Use TYPE 1 (Opinion) or TYPE 3 (Cause/Effect) for the first question. "
                "One question only."
            ),
        })
        text = self._call_llm(messages)
        self._add_examiner(text)
        return AgentResponse(
            examiner_text=text,
            current_part=SpeakingPart.PART3,
            question_number=self._current_question_number(),
        )

    def _end_test(self) -> AgentResponse:
        self.current_part = SpeakingPart.COMPLETED
        text = "That's the end of the speaking test. Thank you very much."
        self._add_examiner(text)
        return AgentResponse(
            examiner_text=text,
            current_part=SpeakingPart.COMPLETED,
            test_complete=True,
        )

    # ── Public API ───────────────────────────────────────────────────

    def get_opening(self) -> AgentResponse:
        messages = [
            {"role": "system", "content": EXAMINER_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    "Start the IELTS Speaking test. "
                    "Greet the candidate, introduce yourself as the examiner. "
                    "Then begin Part 1 STEP 1: ask your first warm-up question "
                    "about Work or Studies. Keep it natural and brief."
                ),
            },
        ]
        text = self._call_llm(messages)
        self._add_examiner(text)
        return AgentResponse(
            examiner_text=text,
            current_part=SpeakingPart.PART1,
            question_number=1,
        )

    def respond(self, candidate_text: str) -> AgentResponse:
        """
        candidate_text may be NO_ANSWER_PLACEHOLDER when the candidate
        stayed silent past the timeout (see routes/speaking_ws.py's
        "skip_no_answer" command) — same state-machine path either way,
        so the test always keeps moving instead of stalling.
        """
        self._add_candidate(candidate_text)
        q = self.question_counts
        q[self.current_part.value] = q.get(self.current_part.value, 0) + 1

        # ── Part transition thresholds (official IELTS) ──
        if self.current_part == SpeakingPart.PART1 and q["part1"] >= 10:
            return self._transition_to_part2()

        if self.current_part == SpeakingPart.PART2 and q["part2"] >= 2:
            return self._transition_to_part3()

        if self.current_part == SpeakingPart.PART3 and q["part3"] >= 6:
            return self._end_test()

        # ── Generate next examiner question ──
        messages = self._history_for_llm()
        no_answer = candidate_text == NO_ANSWER_PLACEHOLDER

        if self.current_part == SpeakingPart.PART1:
            instruction = (
                f"Part 1 — question {q['part1']} asked so far. "
                "Follow the 3-step structure from your instructions. "
                "Ask the next natural Part 1 question. "
                "If you have asked 3-4 questions on current topic, move to next topic. "
                "One short question only. Do not give feedback."
            )
            if no_answer:
                instruction = "The candidate didn't answer — briefly acknowledge and move on. " + instruction
            messages.append({"role": "user", "content": instruction})

        elif self.current_part == SpeakingPart.PART2:
            instruction = (
                "The candidate has finished their Part 2 talk. "
                "Ask ONE brief follow-up question related to what they said. "
                "Keep it very short and natural."
            )
            if no_answer:
                instruction = "The candidate didn't say anything for their long turn. Briefly acknowledge and ask a simple, easy follow-up question to help them get started."
            messages.append({"role": "user", "content": instruction})

        elif self.current_part == SpeakingPart.PART3:
            type_map = {
                1: "OPINION", 2: "COMPARISON", 3: "CAUSE/EFFECT",
                4: "PROBLEM/SOLUTION", 5: "SPECULATION/FUTURE", 6: "OPINION",
            }
            q_num = q["part3"]
            q_type = type_map.get(q_num, "OPINION")
            instruction = (
                f"Part 3 — question {q_num}. "
                f"Use question TYPE: {q_type}. "
                "The question must be ABSTRACT and SOCIETAL — not personal. "
                f"Must be linked to the Part 2 topic: '{self.part2_topic.title}'. "
                "One question only. Do not give feedback."
            )
            if no_answer:
                instruction = "The candidate didn't answer — briefly acknowledge and move on. " + instruction
            messages.append({"role": "user", "content": instruction})

        text = self._call_llm(messages)
        self._add_examiner(text)
        return AgentResponse(
            examiner_text=text,
            current_part=self.current_part,
            question_number=self._current_question_number(),
        )

    def evaluate(self) -> SpeakingResult:
        transcript = self._full_transcript()

        eval_messages = [
            {"role": "system", "content": EVALUATOR_SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"""Evaluate this IELTS Speaking test transcript:

{transcript}

Return ONLY this JSON (no markdown, no extra text):
{{
    "fluency_coherence": {{
        "band": 6.5,
        "feedback": "2-3 sentence honest assessment",
        "examples": ["actual quote from transcript", "another actual quote"],
        "improvements": ["specific actionable tip", "another tip"]
    }},
    "lexical_resource": {{
        "band": 6.0,
        "feedback": "2-3 sentence honest assessment",
        "examples": ["actual quote showing vocabulary use"],
        "improvements": ["specific tip"]
    }},
    "grammatical_range": {{
        "band": 6.5,
        "feedback": "2-3 sentence honest assessment",
        "examples": ["actual quote showing grammar"],
        "improvements": ["specific tip"]
    }},
    "pronunciation": {{
        "band": 6.0,
        "feedback": "Pronunciation cannot be assessed from text. A neutral Band 6 is assigned. In a real IELTS test, this criterion is evaluated by the examiner listening to your actual speech.",
        "examples": [],
        "improvements": ["Record yourself and compare with native speakers", "Focus on word stress and sentence intonation"]
    }},
    "overall_band": 6.5,
    "general_feedback": "2-3 sentence overall summary with main strength and main area to improve"
}}""",
            },
        ]

        raw = self._call_llm(eval_messages, temperature=0.1, max_tokens=1500)
        raw = raw.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(raw, strict=False)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", raw, re.DOTALL)
            data = json.loads(match.group(), strict=False)

        return SpeakingResult(
            fluency_coherence=CriterionScore(**data["fluency_coherence"]),
            lexical_resource=CriterionScore(**data["lexical_resource"]),
            grammatical_range=CriterionScore(**data["grammatical_range"]),
            pronunciation=CriterionScore(**data["pronunciation"]),
            overall_band=data["overall_band"],
            general_feedback=data["general_feedback"],
        )