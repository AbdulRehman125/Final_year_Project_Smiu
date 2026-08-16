# import os
# import json
# import tempfile
# import asyncio
# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from groq import Groq
# from agents.speaking_agent import SpeakingAgent

# router = APIRouter()
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# # Active sessions — session_id: SpeakingAgent
# # Production mein Redis use karo, FYP ke liye in-memory theek hai
# active_sessions: dict[str, SpeakingAgent] = {}


# async def transcribe_audio(audio_bytes: bytes) -> str:
#     """
#     Groq Whisper se audio → text.
#     Audio bytes ko temp file mein save karta hai (Groq file-based API hai).
#     """
#     if len(audio_bytes) < 1000:
#         return ""  # Too small — silence ya noise

#     with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
#         f.write(audio_bytes)
#         temp_path = f.name

#     try:
#         with open(temp_path, "rb") as audio_file:
#             result = groq_client.audio.transcriptions.create(
#                 file=(os.path.basename(temp_path), audio_file, "audio/webm"),
#                 model="whisper-large-v3-turbo",
#                 language="en",
#                 temperature=0.0,
#             )
#         transcript = result.text.strip()
#         return transcript
#     except Exception as e:
#         print(f"STT Error: {e}")
#         return ""
#     finally:
#         os.unlink(temp_path)


# @router.websocket("/ws/speaking/{session_id}")
# async def speaking_websocket(websocket: WebSocket, session_id: str):
#     """
#     Main WebSocket endpoint.
    
#     Frontend se aane wale messages 2 type ke hain:
#     1. Binary (bytes)  → audio chunk — Whisper ko bhejo
#     2. Text (JSON)     → control messages (e.g. part2_ready, end_test)
    
#     Backend se jaane wale messages JSON hain:
#     - type: "opening"         → test shuru, examiner ka pehla message
#     - type: "examiner_text"   → examiner ka response (TTS ke liye)
#     - type: "user_transcript" → user ne kya bola (display ke liye)
#     - type: "part2_topic"     → Part 2 cue card data
#     - type: "evaluation"      → final band scores
#     - type: "error"           → kuch gadbad
#     """
#     await websocket.accept()

#     # Naya agent banao is session ke liye
#     agent = SpeakingAgent()
#     active_sessions[session_id] = agent

#     print(f"Speaking session started: {session_id}")

#     try:
#         # --- Step 1: Examiner ka opening message bhejo ---
#         opening = agent.get_opening()
#         await websocket.send_json({
#             "type": "opening",
#             "text": opening.examiner_text,
#             "part": opening.current_part.value,
#         })

#         # --- Main loop: messages sunna aur respond karna ---
#         while True:
#             try:
#                 # Timeout rakho — agar 5 min koi message nahi toh disconnect
#                 message = await asyncio.wait_for(
#                     websocket.receive(),
#                     timeout=300.0
#                 )
#             except asyncio.TimeoutError:
#                 await websocket.send_json({"type": "error", "message": "Session timeout"})
#                 break

#             # --- Binary message = audio chunk ---
#             if "bytes" in message and message["bytes"]:
#                 audio_bytes = message["bytes"]

#                 # Whisper se transcribe karo
#                 transcript = await asyncio.to_thread(transcribe_audio, audio_bytes)

#                 if not transcript:
#                     # Empty transcript — silence tha, ignore karo
#                     continue

#                 # User ka transcript frontend ko dikhao
#                 await websocket.send_json({
#                     "type": "user_transcript",
#                     "text": transcript,
#                 })

#                 # Agent ko respond karne do
#                 response = agent.respond(transcript)

#                 # Part 2 topic aya? Frontend ko extra data bhejo
#                 if response.part2_topic:
#                     await websocket.send_json({
#                         "type": "part2_topic",
#                         "title": response.part2_topic.title,
#                         "bullet_points": response.part2_topic.bullet_points,
#                     })

#                 # Examiner ka text bhejo (frontend TTS chalayega)
#                 await websocket.send_json({
#                     "type": "examiner_text",
#                     "text": response.examiner_text,
#                     "part": response.current_part.value,
#                     "test_complete": response.test_complete,
#                 })

#                 # Test khatam hua?
#                 if response.test_complete:
#                     # Evaluate karo
#                     await websocket.send_json({
#                         "type": "evaluating",
#                         "message": "Evaluating your performance...",
#                     })
#                     result = await asyncio.to_thread(agent.evaluate)
#                     await websocket.send_json({
#                         "type": "evaluation",
#                         "result": result.dict(),
#                     })
#                     break

#             # --- Text message = control command ---
#             elif "text" in message and message["text"]:
#                 try:
#                     data = json.loads(message["text"])
#                     cmd = data.get("command")

#                     # Part 2: user ne preparation time khatam ki, ab bolega
#                     if cmd == "part2_ready":
#                         await websocket.send_json({
#                             "type": "examiner_text",
#                             "text": "Please begin whenever you're ready.",
#                             "part": "part2",
#                             "test_complete": False,
#                         })

#                     # User ne manually test end kiya
#                     elif cmd == "end_test":
#                         end_response = agent._end_test()
#                         await websocket.send_json({
#                             "type": "examiner_text",
#                             "text": end_response.examiner_text,
#                             "part": "completed",
#                             "test_complete": True,
#                         })
#                         await websocket.send_json({
#                             "type": "evaluating",
#                             "message": "Evaluating your performance...",
#                         })
#                         result = await asyncio.to_thread(agent.evaluate)
#                         await websocket.send_json({
#                             "type": "evaluation",
#                             "result": result.dict(),
#                         })
#                         break

#                 except json.JSONDecodeError:
#                     pass

#     except WebSocketDisconnect:
#         print(f"Session disconnected: {session_id}")
#     except Exception as e:
#         print(f"WebSocket error in session {session_id}: {e}")
#         try:
#             await websocket.send_json({"type": "error", "message": str(e)})
#         except Exception:
#             pass
#     finally:
#         # Session cleanup
#         active_sessions.pop(session_id, None)
#         print(f"Session cleaned up: {session_id}")












# import os
# import json
# import tempfile
# import asyncio
# from fastapi import APIRouter, WebSocket, WebSocketDisconnect
# from groq import Groq
# from dotenv import load_dotenv
# from agents.speaking_agent import SpeakingAgent
 
# load_dotenv()
 
# router = APIRouter()
# groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
 
# active_sessions: dict[str, SpeakingAgent] = {}
 
 
# def transcribe_audio(audio_bytes: bytes) -> str:
#     if len(audio_bytes) < 1000:
#         return ""
 
#     with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
#         f.write(audio_bytes)
#         temp_path = f.name
 
#     try:
#         with open(temp_path, "rb") as audio_file:
#             result = groq_client.audio.transcriptions.create(
#                 file=(os.path.basename(temp_path), audio_file, "audio/webm"),
#                 model="whisper-large-v3-turbo",
#                 language="en",
#                 temperature=0.0,
#             )
#         return result.text.strip()
#     except Exception as e:
#         print(f"STT Error: {e}")
#         return ""
#     finally:
#         os.unlink(temp_path)
 
 
# @router.websocket("/ws/speaking/{session_id}")
# async def speaking_websocket(websocket: WebSocket, session_id: str):
#     await websocket.accept()
 
#     agent = SpeakingAgent()
#     active_sessions[session_id] = agent
#     print(f"Speaking session started: {session_id}")
 
#     try:
#         # Examiner ka opening message — sync call, thread mein run karo
#         opening = await asyncio.to_thread(agent.get_opening)
#         await websocket.send_json({
#             "type": "opening",
#             "text": opening.examiner_text,
#             "part": opening.current_part.value,
#         })
 
#         while True:
#             try:
#                 message = await asyncio.wait_for(
#                     websocket.receive(),
#                     timeout=300.0
#                 )
#             except asyncio.TimeoutError:
#                 await websocket.send_json({"type": "error", "message": "Session timeout"})
#                 break
 
#             # Binary = audio chunk
#             if "bytes" in message and message["bytes"]:
#                 audio_bytes = message["bytes"]
 
#                 transcript = await asyncio.to_thread(transcribe_audio, audio_bytes)
 
#                 if not transcript:
#                     continue
 
#                 await websocket.send_json({
#                     "type": "user_transcript",
#                     "text": transcript,
#                 })
 
#                 response = await asyncio.to_thread(agent.respond, transcript)
 
#                 if response.part2_topic:
#                     await websocket.send_json({
#                         "type": "part2_topic",
#                         "title": response.part2_topic.title,
#                         "bullet_points": response.part2_topic.bullet_points,
#                     })
 
#                 await websocket.send_json({
#                     "type": "examiner_text",
#                     "text": response.examiner_text,
#                     "part": response.current_part.value,
#                     "test_complete": response.test_complete,
#                 })
 
#                 if response.test_complete:
#                     await websocket.send_json({
#                         "type": "evaluating",
#                         "message": "Evaluating your performance...",
#                     })
#                     result = await asyncio.to_thread(agent.evaluate)
#                     await websocket.send_json({
#                         "type": "evaluation",
#                         "result": result.dict(),
#                     })
#                     break
 
#             # Text = control command
#             elif "text" in message and message["text"]:
#                 try:
#                     data = json.loads(message["text"])
#                     cmd = data.get("command")
 
#                     if cmd == "part2_ready":
#                         await websocket.send_json({
#                             "type": "examiner_text",
#                             "text": "Please begin whenever you're ready.",
#                             "part": "part2",
#                             "test_complete": False,
#                         })
 
#                     elif cmd == "end_test":
#                         end_response = await asyncio.to_thread(agent._end_test)
#                         await websocket.send_json({
#                             "type": "examiner_text",
#                             "text": end_response.examiner_text,
#                             "part": "completed",
#                             "test_complete": True,
#                         })
#                         await websocket.send_json({
#                             "type": "evaluating",
#                             "message": "Evaluating your performance...",
#                         })
#                         result = await asyncio.to_thread(agent.evaluate)
#                         await websocket.send_json({
#                             "type": "evaluation",
#                             "result": result.dict(),
#                         })
#                         break
 
#                 except json.JSONDecodeError:
#                     pass
 
#     except WebSocketDisconnect:
#         print(f"Session disconnected: {session_id}")
#     except Exception as e:
#         print(f"WebSocket error in session {session_id}: {e}")
#         try:
#             await websocket.send_json({"type": "error", "message": str(e)})
#         except Exception:
#             pass
#     finally:
#         active_sessions.pop(session_id, None)
#         print(f"Session cleaned up: {session_id}")

































# routes/speaking_ws.py
# WebSocket endpoint for the IELTS Speaking test.

import os
import json
import tempfile
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from groq import Groq
from loguru import logger

from core.dynamic_settings import get_raw_groq_client
from agents.speaking_agent import SpeakingAgent, NO_ANSWER_PLACEHOLDER, RateLimitExceededError

router = APIRouter()

# Active sessions — session_id: SpeakingAgent.
# In-memory by design for now; a horizontally-scaled deployment would need
# this moved to Redis (or similar) so any server instance can serve any
# session, and so sessions survive a restart.
active_sessions: dict[str, SpeakingAgent] = {}


def transcribe_audio(audio_bytes: bytes) -> str:
    """Sync Whisper call — always run via asyncio.to_thread()."""
    if len(audio_bytes) < 1000:
        return ""  # Too small to contain real speech

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(audio_bytes)
        temp_path = f.name

    try:
        client = get_raw_groq_client()
        with open(temp_path, "rb") as audio_file:
            result = client.audio.transcriptions.create(
                file=(os.path.basename(temp_path), audio_file, "audio/webm"),
                model="whisper-large-v3-turbo",
                language="en",
                temperature=0.0,
            )
        return result.text.strip()
    except Exception as e:
        logger.error(f"Whisper transcription error: {e}")
        return ""
    finally:
        os.unlink(temp_path)


async def _send_agent_response(websocket: WebSocket, response) -> bool:
    """Sends an AgentResponse to the client and, if the test just
    completed, runs + sends the evaluation. Returns True if the caller
    should stop the main loop (test finished)."""
    if response.part2_topic:
        await websocket.send_json({
            "type": "part2_topic",
            "title": response.part2_topic.title,
            "bullet_points": response.part2_topic.bullet_points,
        })

    await websocket.send_json({
        "type": "examiner_text",
        "text": response.examiner_text,
        "part": response.current_part.value,
        "test_complete": response.test_complete,
        "question_number": response.question_number,
    })

    if not response.test_complete:
        return False

    await websocket.send_json({
        "type": "evaluating",
        "message": "Evaluating your performance...",
    })
    return True


@router.websocket("/ws/speaking/{session_id}")
async def speaking_websocket(websocket: WebSocket, session_id: str):
    """
    Binary messages  → audio chunk → transcribed via Whisper.
    Text messages    → JSON control commands:
      - "part2_ready"    candidate's 1-min prep timer ended
      - "skip_no_answer" candidate gave no answer within the silence
                          timeout (or pressed Skip) — advance anyway
                          instead of the session stalling
      - "end_test"       candidate ended the test early

    Outbound message types: opening, user_transcript, part2_topic,
    examiner_text, no_speech_detected, evaluating, evaluation, error.
    """
    await websocket.accept()

    agent = SpeakingAgent()
    active_sessions[session_id] = agent
    logger.info(f"Speaking session started: {session_id}")

    try:
        opening = await asyncio.to_thread(agent.get_opening)
        await websocket.send_json({
            "type": "opening",
            "text": opening.examiner_text,
            "part": opening.current_part.value,
            "question_number": opening.question_number,
        })

        while True:
            try:
                message = await asyncio.wait_for(websocket.receive(), timeout=300.0)
            except asyncio.TimeoutError:
                await websocket.send_json({"type": "error", "message": "Session timeout"})
                break

            # ── Binary = audio chunk ──
            if "bytes" in message and message["bytes"]:
                audio_bytes = message["bytes"]
                transcript = await asyncio.to_thread(transcribe_audio, audio_bytes)

                if not transcript:
                    # Previously this just silently `continue`d forever —
                    # the frontend's mic was already closed with nothing
                    # telling it to reopen, so the session would appear to
                    # freeze. Now we explicitly tell the client to re-arm
                    # the mic and try again.
                    await websocket.send_json({"type": "no_speech_detected"})
                    continue

                await websocket.send_json({"type": "user_transcript", "text": transcript})

                response = await asyncio.to_thread(agent.respond, transcript)
                if await _send_agent_response(websocket, response):
                    result = await asyncio.to_thread(agent.evaluate)
                    await websocket.send_json({"type": "evaluation", "result": result.model_dump()})
                    break

            # ── Text = control command ──
            elif "text" in message and message["text"]:
                try:
                    data = json.loads(message["text"])
                    cmd = data.get("command")

                    if cmd == "part2_ready":
                        await websocket.send_json({
                            "type": "examiner_text",
                            "text": "Please begin whenever you're ready.",
                            "part": "part2",
                            "test_complete": False,
                            "question_number": 0,
                        })

                    elif cmd == "skip_no_answer":
                        response = await asyncio.to_thread(agent.respond, NO_ANSWER_PLACEHOLDER)
                        if await _send_agent_response(websocket, response):
                            result = await asyncio.to_thread(agent.evaluate)
                            await websocket.send_json({"type": "evaluation", "result": result.model_dump()})
                            break

                    elif cmd == "end_test":
                        end_response = await asyncio.to_thread(agent._end_test)
                        await _send_agent_response(websocket, end_response)
                        result = await asyncio.to_thread(agent.evaluate)
                        await websocket.send_json({"type": "evaluation", "result": result.model_dump()})
                        break

                except json.JSONDecodeError:
                    logger.warning(f"Malformed control message from {session_id}: {message['text']!r}")

    except WebSocketDisconnect:
        logger.info(f"Session disconnected: {session_id}")
    except RateLimitExceededError as e:
        logger.error(f"Rate limit exceeded in session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        try:
            await websocket.send_json({"type": "error", "message": "Something went wrong. Please refresh and try again."})
        except Exception:
            pass
    finally:
        active_sessions.pop(session_id, None)
        logger.info(f"Session cleaned up: {session_id}")