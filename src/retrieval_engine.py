"""
Retrieval-Augmented Generation (RAG) Engine for MaltCache AI
Performs vector similarity search across indexed document chunks and builds grounded prompts.
"""

from typing import Any, Dict, List, Optional
from .database import Database
from .embeddings import EmbeddingsEngine


class RetrievalEngine:
    def __init__(self, db: Database, embeddings: EmbeddingsEngine, default_top_k: int = 3):
        self.db = db
        self.embeddings = embeddings
        self.default_top_k = default_top_k

    def retrieve(
        self,
        query: str,
        top_k: Optional[int] = None,
        query_embedding: Optional[List[float]] = None,
        min_similarity: float = 0.20,
    ) -> List[Dict[str, Any]]:
        k = top_k or self.default_top_k
        chunks = self.db.get_all_document_chunks()

        if not chunks:
            return []

        q_vec = query_embedding if query_embedding is not None else self.embeddings.embed_text(query)

        scored_chunks = []
        for chunk in chunks:
            c_vec = chunk.get("embedding", [])
            sim = self.embeddings.cosine_similarity(q_vec, c_vec)
            if sim >= min_similarity:
                chunk_copy = dict(chunk)
                chunk_copy["similarity_score"] = round(sim, 4)
                # do not expose raw large embedding in results
                chunk_copy.pop("embedding", None)
                scored_chunks.append(chunk_copy)

        # Sort descending by similarity
        scored_chunks.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_chunks[:k]

    @staticmethod
    def build_grounded_context(retrieved_chunks: List[Dict[str, Any]]) -> str:
        if not retrieved_chunks:
            return "No document context available."

        context_blocks = []
        for idx, chunk in enumerate(retrieved_chunks):
            doc_name = chunk.get("doc_name", "Unknown")
            page = chunk.get("metadata", {}).get("page", 1)
            score = chunk.get("similarity_score", 0.0)
            content = chunk.get("content", "").strip()
            context_blocks.append(
                f"--- [Source {idx + 1}: {doc_name} | Page {page} | Relevance: {score:.3f}] ---\n{content}"
            )
        return "\n\n".join(context_blocks)
