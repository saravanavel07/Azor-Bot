"""
Analytics & Metrics Engine for MaltCache AI
Computes real-time telemetry: cache hits vs misses, hit rate trend, latency distributions, and cost savings.
"""

from typing import Any, Dict, List
from .database import Database


class AnalyticsEngine:
    def __init__(self, db: Database):
        self.db = db
        # Estimated cost saved per token avoided via cache hit ($0.000002 / token)
        self.cost_per_token = 0.000002

    def get_summary_metrics(self) -> Dict[str, Any]:
        logs = self.db.get_query_logs(limit=500)
        cache_entries = self.db.get_all_cache_entries()
        doc_chunks = self.db.get_all_document_chunks()

        total_queries = len(logs)
        cache_hits = sum(1 for log in logs if log.get("status") == "HIT")
        cache_misses = sum(1 for log in logs if log.get("status") in ["MISS", "RAG_ONLY", "COLD_RUN"])

        hit_rate = (cache_hits / total_queries * 100.0) if total_queries > 0 else 0.0
        
        # Calculate latencies
        hit_latencies = [log["latency_ms"] for log in logs if log.get("status") == "HIT"]
        miss_latencies = [log["latency_ms"] for log in logs if log.get("status") != "HIT"]

        avg_hit_latency = (sum(hit_latencies) / len(hit_latencies)) if hit_latencies else 6.5
        avg_miss_latency = (sum(miss_latencies) / len(miss_latencies)) if miss_latencies else 950.0

        total_tokens_saved = sum(log.get("tokens_saved", 0) for log in logs)
        total_cost_saved = total_tokens_saved * self.cost_per_token

        return {
            "total_queries": total_queries,
            "cache_hits": cache_hits,
            "cache_misses": cache_misses,
            "hit_rate_pct": round(hit_rate, 1),
            "total_cached_answers": len(cache_entries),
            "total_indexed_chunks": len(doc_chunks),
            "avg_hit_latency_ms": round(avg_hit_latency, 1),
            "avg_miss_latency_ms": round(avg_miss_latency, 1),
            "latency_reduction_pct": round(((avg_miss_latency - avg_hit_latency) / avg_miss_latency * 100.0), 1) if avg_miss_latency > 0 else 0.0,
            "total_tokens_saved": total_tokens_saved,
            "total_cost_saved_usd": round(total_cost_saved, 4),
        }

    def get_top_reused_entries(self, limit: int = 5) -> List[Dict[str, Any]]:
        entries = self.db.get_all_cache_entries()
        sorted_entries = sorted(entries, key=lambda x: x.get("hit_count", 0), reverse=True)
        return [
            {
                "id": e["id"],
                "query": e["query"],
                "hit_count": e["hit_count"],
                "model": e["model"],
                "last_accessed_at": e["last_accessed_at"],
            }
            for e in sorted_entries[:limit]
        ]
