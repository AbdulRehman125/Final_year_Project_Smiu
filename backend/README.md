# AI-IELTS Backend

FastAPI + LangChain backend for the IELTS Writing Module.

## Setup

### 1. Python version
```bash
python --version   # Must be 3.10+
```

### 2. Create virtual environment
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment variables
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY in .env
```

### 5. Run the server
```bash
uvicorn main:app --reload --port 8000
```

Server runs at: http://localhost:8000  
API Docs at:    http://localhost:8000/docs

## Folder Structure

```
backend/
├── main.py              # FastAPI app entry point
├── requirements.txt     # Python dependencies
├── .env.example         # Environment variables template
│
├── core/
│   └── config.py        # App settings (reads .env)
│
├── agents/
│   └── writing_agent.py # Main evaluation agent (LangChain + Claude)
│
├── prompts/
│   └── writing_prompts.py  # IELTS system prompts (official band descriptors)
│
├── tools/
│   └── writing_tools.py    # LangChain tools (word count, bullet check, etc.)
│
├── routes/
│   └── writing.py       # POST /api/writing/evaluate
│
└── schemas/
    └── writing_schema.py   # Pydantic input/output models
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET  | `/health` | Server health check |
| POST | `/api/writing/evaluate` | Evaluate Task 1 + Task 2 |
| GET  | `/api/writing/health` | Writing module health check |

## Frontend Integration (Next.js)

```typescript
const response = await fetch('http://localhost:8000/api/writing/evaluate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    test_type: 'academic',
    task1_question: { ... },
    task2_question: { ... },
    task1_response: '...',
    task2_response: '...',
    time_taken_seconds: 3420,
  })
})
const result = await response.json()
```
