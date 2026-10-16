# MaltCache AI — CAG + RAG Intelligence Platform
> *Intelligence, with memory.*

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Framework](https://img.shields.io/badge/Streamlit-1.35%2B-red.svg)](https://streamlit.io/)
[![License](https://img.shields.io/badge/License-Apache%202.0-green.svg)](LICENSE)
[![Theme](https://img.shields.io/badge/Design-Malt%20%26%20Cocoa-7B482C.svg)](#)

MaltCache AI is an advanced enterprise AI platform unifying **Cache-Augmented Generation (CAG)** and **Retrieval-Augmented Generation (RAG)** into an intelligent, dual-engine cognitive pipeline. It slashes LLM inferencing costs and response latency by up to 98% while ensuring rigorous document grounding and factual precision.

---

## 🎨 Visual Identity & Palette
- **Malt Cream:** `#F5E5C9`
- **Warm White:** `#FFF8ED`
- **Caramel Brown:** `#7B482C`
- **Dark Cocoa:** `#3B2419`
- **Golden Malt:** `#D9AD72`
- **Soft Beige:** `#E8C99E`

---

## 🚀 Key Features

1. **Semantic Cache Engine (CAG)**
   - High-dimensional vector cosine similarity lookup.
   - Sub-10ms response latency on cache hits with zero token consumption.
   - Configurable similarity threshold ($0.50$ to $0.99$).
   - TTL-based invalidation and safety guardrails for temporal/sensitive queries.

2. **Document Retrieval Engine (RAG)**
   - Multi-format document parser supporting PDF, TXT, and Markdown.
   - Configurable chunk size and sliding overlap window.
   - Top-K cosine similarity chunk ranking with source attribution.
   - Strict hallucination guardrails.

3. **Hybrid CAG + RAG Engine**
   - Seamless fall-through orchestration: Cache Lookup $\rightarrow$ Cache Hit/Miss $\rightarrow$ Document Retrieval $\rightarrow$ LLM Synthesis $\rightarrow$ Conditional Caching.

4. **Cache Observatory & Telemetry**
   - Real-time Plotly charts tracking hit/miss ratios, latency curves, and cost savings.
   - Granular cache inspection, per-item invalidation, and similarity tester.

5. **Live Motion Particle Ambiance**
   - Canvas-based particle animation with warm golden & caramel data nodes.

---

## 🏗️ Project Architecture

```
maltcache-ai/
├── app.py                     # Streamlit web application entry point
├── server.ts                  # Full-stack Node/Express + Vite server
├── requirements.txt           # Python dependencies
├── README.md                  # Comprehensive documentation
├── MASTER_PROMPT.md           # Engineering master prompt
├── .streamlit/
│   └── secrets.toml.example   # Streamlit secrets template
├── src/
│   ├── __init__.py
│   ├── cache_engine.py        # CAG semantic caching & threshold logic
│   ├── retrieval_engine.py    # RAG vector retrieval & context builder
│   ├── embeddings.py          # Vector embedding & cosine similarity
│   ├── llm_provider.py        # Gemini / OpenAI / Local synthesis
│   ├── document_processor.py  # PDF/TXT/MD chunking & tokenization
│   ├── database.py            # SQLite schema, queries & logging
│   └── analytics.py           # Real-time metrics & cost calculation
├── tests/
│   ├── test_cache.py          # Semantic cache unit tests
│   ├── test_retrieval.py      # Vector retrieval unit tests
│   └── test_documents.py      # Document chunking tests
├── assets/
│   └── logo.svg               # Computer-system monitor logo
└── docs/
    └── architecture.md        # Deep architectural specifications
```

---

## ⚡ Quick Start (Streamlit)

### 1. Prerequisites
- Python 3.10 or higher
- Git

### 2. Clone & Setup Virtual Environment
```bash
git clone https://github.com/your-username/maltcache-ai.git
cd maltcache-ai

# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API Keys (Optional)
Copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml`:
```bash
# Windows PowerShell
Copy-Item .streamlit/secrets.toml.example .streamlit/secrets.toml

# Linux / macOS
cp .streamlit/secrets.toml.example .streamlit/secrets.toml
```
Configure your `GEMINI_API_KEY` or `OPENAI_API_KEY`. If unconfigured, MaltCache AI automatically activates its internal local grounded synthesizer.

### 5. Run the Application
```bash
streamlit run app.py
```

### 6. Run Automated Tests
```bash
python -m unittest discover tests
```

---

## 🔒 Security & Reliability Safeguards
- **Zero Hardcoded Secrets:** Credentials exclusively read from environment variables or secure storage.
- **Cache Isolation:** Distinct hashing prevents crosstalk across conflicting schemas.
- **Temporal Query Safety:** Auto-bypasses caching for volatile time-dependent tokens.
- **Graceful Offline Degrade:** Internal high-precision fallback embeddings ensure full offline operability.

---

## 📄 License
Apache License 2.0. Copyright (c) MaltCache AI Engineering Team.
