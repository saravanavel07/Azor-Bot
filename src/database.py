"""
Database Layer for MaltCache AI
Provides SQLite persistent storage for semantic cache entries, query logs, and document chunk indices.
"""

import json
import sqlite3
import time
from typing import Any, Dict, List, Optional


class Database:
    def __init__(self, db_path: str = "maltcache.db"):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Semantic Cache Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS semantic_cache (
                    id TEXT PRIMARY KEY,
                    query TEXT NOT NULL,
                    normalized_query TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    model TEXT NOT NULL,
                    source TEXT NOT NULL,
                    created_at REAL NOT NULL,
                    last_accessed_at REAL NOT NULL,
                    hit_count INTEGER DEFAULT 0,
                    ttl_seconds INTEGER DEFAULT 0,
                    metadata_json TEXT DEFAULT '{}'
                )
            """)

            # Query Metrics & Audit Log
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS query_logs (
                    id TEXT PRIMARY KEY,
                    query TEXT NOT NULL,
                    mode TEXT NOT NULL,
                    status TEXT NOT NULL,
                    similarity_score REAL DEFAULT 0.0,
                    matched_query TEXT,
                    latency_ms REAL NOT NULL,
                    tokens_saved INTEGER DEFAULT 0,
                    cost_saved_usd REAL DEFAULT 0.0,
                    timestamp REAL NOT NULL
                )
            """)

            # Document Chunks Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS document_chunks (
                    id TEXT PRIMARY KEY,
                    doc_name TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL,
                    content TEXT NOT NULL,
                    embedding_json TEXT NOT NULL,
                    token_count INTEGER NOT NULL,
                    metadata_json TEXT DEFAULT '{}',
                    created_at REAL NOT NULL
                )
            """)
            conn.commit()

    def store_cache_entry(
        self,
        entry_id: str,
        query: str,
        normalized_query: str,
        answer: str,
        embedding: List[float],
        model: str,
        source: str = "llm",
        ttl_seconds: int = 0,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO semantic_cache 
                (id, query, normalized_query, answer, embedding_json, model, source, created_at, last_accessed_at, hit_count, ttl_seconds, metadata_json)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
                """,
                (
                    entry_id,
                    query,
                    normalized_query,
                    answer,
                    json.dumps(embedding),
                    model,
                    source,
                    now,
                    now,
                    ttl_seconds,
                    json.dumps(metadata or {}),
                ),
            )
            conn.commit()

    def get_all_cache_entries(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM semantic_cache ORDER BY created_at DESC")
            rows = cursor.fetchall()
            entries = []
            for r in rows:
                entries.append({
                    "id": r["id"],
                    "query": r["query"],
                    "normalized_query": r["normalized_query"],
                    "answer": r["answer"],
                    "embedding": json.loads(r["embedding_json"]),
                    "model": r["model"],
                    "source": r["source"],
                    "created_at": r["created_at"],
                    "last_accessed_at": r["last_accessed_at"],
                    "hit_count": r["hit_count"],
                    "ttl_seconds": r["ttl_seconds"],
                    "metadata": json.loads(r["metadata_json"]),
                })
            return entries

    def increment_hit(self, entry_id: str) -> None:
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE semantic_cache 
                SET hit_count = hit_count + 1, last_accessed_at = ?
                WHERE id = ?
                """,
                (now, entry_id),
            )
            conn.commit()

    def delete_cache_entry(self, entry_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM semantic_cache WHERE id = ?", (entry_id,))
            conn.commit()
            return cursor.rowcount > 0

    def clear_all_cache(self) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM semantic_cache")
            conn.commit()

    def log_query(
        self,
        log_id: str,
        query: str,
        mode: str,
        status: str,
        similarity_score: float,
        matched_query: Optional[str],
        latency_ms: float,
        tokens_saved: int,
        cost_saved_usd: float,
    ) -> None:
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO query_logs 
                (id, query, mode, status, similarity_score, matched_query, latency_ms, tokens_saved, cost_saved_usd, timestamp)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    log_id,
                    query,
                    mode,
                    status,
                    similarity_score,
                    matched_query,
                    latency_ms,
                    tokens_saved,
                    cost_saved_usd,
                    now,
                ),
            )
            conn.commit()

    def get_query_logs(self, limit: int = 100) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM query_logs ORDER BY timestamp DESC LIMIT ?", (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def store_document_chunk(
        self,
        chunk_id: str,
        doc_name: str,
        chunk_index: int,
        content: str,
        embedding: List[float],
        token_count: int,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        now = time.time()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT OR REPLACE INTO document_chunks
                (id, doc_name, chunk_index, content, embedding_json, token_count, metadata_json, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    chunk_id,
                    doc_name,
                    chunk_index,
                    content,
                    json.dumps(embedding),
                    token_count,
                    json.dumps(metadata or {}),
                    now,
                ),
            )
            conn.commit()

    def get_all_document_chunks(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM document_chunks ORDER BY doc_name, chunk_index")
            rows = cursor.fetchall()
            chunks = []
            for r in rows:
                chunks.append({
                    "id": r["id"],
                    "doc_name": r["doc_name"],
                    "chunk_index": r["chunk_index"],
                    "content": r["content"],
                    "embedding": json.loads(r["embedding_json"]),
                    "token_count": r["token_count"],
                    "metadata": json.loads(r["metadata_json"]),
                    "created_at": r["created_at"],
                })
            return chunks

    def delete_document(self, doc_name: str) -> None:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM document_chunks WHERE doc_name = ?", (doc_name,))
            conn.commit()
