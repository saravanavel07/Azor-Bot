"""
Cache-Augmented Generation (CAG) Semantic Engine for MaltCache AI
Handles semantic cache lookup, threshold matching, cache safety rules, and lifecycle invalidation.
"""

import re
import time
import uuid
from typing import Any, Dict, List, Optional, Tuple
from .database import Database
from .embeddings import EmbeddingsEngine


class CacheEngine:
    def __init__(
        self,
        db: Database,
        embeddings: EmbeddingsEngine,
        similarity_threshold: float = 0.85,
        default_ttl_seconds: int = 86400,
    ):
        self.db = db
        self.embeddings = embeddings
        self.similarity_threshold = similarity_threshold
        self.default_ttl_seconds = default_ttl_seconds

    @staticmethod
    def normalize_query(query: str) -> str:
        # Lowercase, trim whitespace, normalize punctuation
        cleaned = query.strip().lower()
        cleaned = re.sub(r"[^\w\s\?\.\-]", "", cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned

    def is_cache_safe(self, query: str) -> Tuple[bool, Optional[str]]:
        """
        Safety check: do not cache time-sensitive queries, personal identifiers, or volatile real-time questions.
        """
        lower = query.lower()
        temporal_keywords = ["today", "right now", "current time", "yesterday", "tomorrow", "this hour", "latest stock"]
        for kw in temporal_keywords:
            if kw in lower:
                return False, f"Query contains temporal keyword '{kw}' — bypass recommended to prevent stale responses."

        sensitive_keywords = ["password", "api key", "secret", "credit card", "ssn"]
        for kw in sensitive_keywords:
            if kw in lower:
                return False, f"Query contains sensitive pattern '{kw}' — bypass recommended for safety."

        return True, None

    def lookup(
        self,
        query: str,
        threshold: Optional[float] = None,
        embedding: Optional[List[float]] = None,
    ) -> Dict[str, Any]:
        """
        Executes semantic cache lookup.
        Returns:
            {
                "hit": bool,
                "similarity_score": float,
                "cached_entry": Optional[dict],
                "evaluated_count": int,
                "reason": str
            }
        """
        target_threshold = threshold if threshold is not None else self.similarity_threshold
        safe, reason = self.is_cache_safe(query)
        if not safe:
            return {
                "hit": False,
                "similarity_score": 0.0,
                "cached_entry": None,
                "evaluated_count": 0,
                "reason": f"Cache bypassed: {reason}",
            }

        entries = self.db.get_all_cache_entries()
        if not entries:
            return {
                "hit": False,
                "similarity_score": 0.0,
                "cached_entry": None,
                "evaluated_count": 0,
                "reason": "Cache is empty.",
            }

        norm_query = self.normalize_query(query)
        query_vec = embedding if embedding is not None else self.embeddings.embed_text(norm_query)

        now = time.time()
        best_score = -1.0
        best_entry = None

        valid_entries_count = 0
        for entry in entries:
            # Check TTL
            ttl = entry.get("ttl_seconds", 0)
            if ttl > 0 and (now - entry["created_at"]) > ttl:
                # Expired entry - skip or auto invalidate
                continue

            valid_entries_count += 1
            cached_vec = entry.get("embedding", [])
            score = self.embeddings.cosine_similarity(query_vec, cached_vec)

            if score > best_score:
                best_score = score
                best_entry = entry

        # Decision based on threshold
        if best_entry and best_score >= target_threshold:
            # Record hit in DB
            self.db.increment_hit(best_entry["id"])
            return {
                "hit": True,
                "similarity_score": round(best_score, 4),
                "cached_entry": best_entry,
                "evaluated_count": valid_entries_count,
                "reason": f"Semantic similarity {best_score:.4f} meets or exceeds threshold {target_threshold:.2f}.",
            }

        return {
            "hit": False,
            "similarity_score": round(max(0.0, best_score), 4),
            "cached_entry": best_entry,  # include best candidate for inspection even if missed
            "evaluated_count": valid_entries_count,
            "reason": (
                f"Best similarity was {best_score:.4f}, below threshold {target_threshold:.2f}."
                if best_entry
                else "No valid cache entries found."
            ),
        }

    def store(
        self,
        query: str,
        answer: str,
        model: str,
        source: str = "llm",
        ttl_seconds: Optional[int] = None,
        embedding: Optional[List[float]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> str:
        entry_id = str(uuid.uuid4())
        norm_query = self.normalize_query(query)
        vec = embedding if embedding is not None else self.embeddings.embed_text(norm_query)
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl_seconds

        self.db.store_cache_entry(
            entry_id=entry_id,
            query=query,
            normalized_query=norm_query,
            answer=answer,
            embedding=vec,
            model=model,
            source=source,
            ttl_seconds=ttl,
            metadata=metadata or {},
        )
        return entry_id

    def invalidate(self, entry_id: str) -> bool:
        return self.db.delete_cache_entry(entry_id)

    def clear(self) -> None:
        self.db.clear_all_cache()
