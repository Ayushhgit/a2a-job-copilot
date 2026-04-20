# A2A - AI Job Copilot System 🚀

![A2A Protocol](https://img.shields.io/badge/A2A-Protocol-emerald?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Groq](https://img.shields.io/badge/Groq-LLM-f55036?style=for-the-badge)

A2A (Agent-to-Agent) is an open-source, AI-powered system designed to completely automate and optimize the resume customization process. By utilizing a multi-agent architectural pipeline, the system extracts requirements from Job Descriptions, retrieves relevant personal experiences via Vector embeddings, and generates a flawless, ATS-optimized LaTeX resume. 

All of this happens in front of you via a real-time reactive graph UI visualizing the "thought process" and routing between agents.

## 🌟 Key Features

- **Multi-Agent Orchestration**: A dynamic `LLMRouter` delegates tasks between specialized agents:
  - 🔍 **JD Analyzer**: Extracts core requirements and skills.
  - 🤝 **Matcher**: Queries the vector store to align your experiences.
  - 📝 **Resume Generator**: Structures the final JSON resume format.
  - 🚀 **Optimizer**: Perfects phrasing and triggers compilation.
- **RAG & Vector Search**: Uses **FAISS** and Sentence Transformers to store and intelligently retrieve project experience and career milestones.
- **Real-Time Graph UI**: Watch the agents communicate! Frontend uses **React Flow** and **Server-Sent Events (SSE)** to stream agent interactions dynamically.
- **LaTeX Rendering**: Produces professional, visually sharp, and heavily ATS-optimized `.tex` resume files.

---

## 🏗️ Architecture Stack

### Backend (`/backend`)
- **Core Framework**: Python 3.10+, FastAPI
- **LLM Provider**: Groq API (Default model: `llama3-70b-8192`)
- **Vector Engine**: `faiss-cpu`, `sentence-transformers`
- **Other**: `pydantic`, `loguru`, custom Async Event Bus.

### Frontend (`/frontend`)
- **Core Framework**: React 18, Vite, TypeScript
- **Styling**: TailwindCSS (Glassmorphism aesthetics)
- **State & Stores**: Zustand
- **Visualization**: React Flow (`reactflow`)

---

## 🚀 Getting Started

Ensure you have Python 3.10+ and Node.js v18+ installed on your machine.

### 1. Backend Setup

Navigate to the backend directory and set up your python environment (e.g., using `uv` or `venv`):

```bash
cd backend
# Create and activate virtual environment
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the `backend` directory:
```env
# backend/.env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
```

#### Run the Server
```bash
# Start the FastAPI server on port 8000
uvicorn app.main:app --reload
```

### 2. Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will start at `http://localhost:5173`. Open it in your browser, enter a job description in the Task Input, and watch the agents go to work!

---

## 🛠️ How it works under the hood

1. **User Input:** A user subits a task/JD to the FastAPI backend.
2. **Event Bus:** The message hits the `LLMRouter` over the internal async Event Bus.
3. **Agent Routing:** The LLM evaluates the payload and routes it to the most relevant agent (e.g., to `JDAnalyzer`).
4. **SSE Streaming:** Every decision edge and log is published to `/api/events`, which the React UI listens to and renders the Flow Graph nodes.
5. **Tool Execution:** Agents may invoke tools like `VectorSearchTool` to fetch FAISS data.
6. **Task Complete:** The `CompileLatexTool` pushes the final render event back to the Frontend.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📝 License

This project is open-source and available under the standard MIT License.
