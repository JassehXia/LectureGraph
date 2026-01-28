# 🎓 LectureGraph

LectureGraph is a multimodal learning platform that solves the "linear information problem" in education. It transforms traditional video lectures into interactive, 2D knowledge graphs, allowing users to navigate content semantically rather than chronologically.

## 🚀 The Vision
Traditional video lectures are hard to navigate. Finding a specific concept usually involves scrubbing through hours of footage. **LectureGraph** uses AI to "unfold" the video:
- Every technical concept becomes a **node**.
- Connections between concepts become **edges**.
- One click on a node **teleports** you to the exact timestamp in the lecture.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Framer Motion, `react-force-graph`.
- **Backend**: FastAPI (Python) for AI processing.
- **AI/ML**: OpenAI Whisper (Transcription), GPT-4o-mini (Concept Extraction).
- **Storage**: Cloudflare R2 (S3-compatible, zero egress fees).
- **Database**: PostgreSQL with Prisma ORM.

---

## 🏗️ Architecture
LectureGraph uses a **Dual-Service Architecture**:
1. **Next.js (Orchestrator)**: Handles the UI, Auth, and the Relational Database.
2. **FastAPI (AI Engine)**: Handles the heavy-lifting Python tasks like transcription and LLM analysis.

---

## 📖 How It Works (For Students)
1. **The Ear (Whisper)**: We feed your lecture video into OpenAI's Whisper model. It doesn't just "hear" words; it maps every single word to a precise millisecond (Word-level Timestamps).
2. **The Brain (LLM)**: We take the flat transcript and hand it to a Large Language Model. We ask it: *"What are the core technical concepts here, and how do they build on each other?"*
3. **The Web (Graph)**: We store these concepts and their connections. When you see the graph, clicking a node sends a "Seek" command to the video player, jumping you straight to the explanation.

---

## 🚦 Getting Started (Iteration 1)
Currently, LectureGraph is in its **Local Foundation** phase.

### Backend Setup
1. `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Install dependencies: `.\venv\Scripts\pip install -r requirements.txt`
4. Create a `.env` file with `OPENAI_API_KEY`.
5. Run the transcription test:
   ```bash
   .\venv\Scripts\python services\transcription.py path/to/lecture.mp4
   ```

### Prerequisites
- **FFmpeg**: Required by Whisper for audio extraction. (Install via `scoop install ffmpeg` or `choco install ffmpeg`).

---

## 🗺️ Roadmap
- [x] **Iteration 1**: Local transcription & concept extraction.
- [ ] **Iteration 2**: Cloudflare R2 integration & Next.js Upload UI.
- [ ] **Iteration 3**: Interactive Video Player & Concept list.
- [ ] **Iteration 4**: Knowledge Graph Visualization.
- [ ] **Iteration 5**: Full Deployment & Aesthetics.
