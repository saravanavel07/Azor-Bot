# MaltCache AI — Architecture & Technical Specifications

## 1. System Vision
**MaltCache AI** bridges high-speed semantic response caching (**CAG**) with authoritative document-grounded context retrieval (**RAG**).

```
                      +-----------------------------+
                      |       User Question         |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   1. Query Normalization    |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      | 2. Vector Embedding Engine  |
                      |   (Cosine Representation)   |
                      +--------------+--------------+
                                     |
             +-----------------------+-----------------------+
             |                                               |
             v                                               v
+-------------------------+                     +-------------------------+
|   CAG Semantic Cache    |                     |    RAG Document Store   |
|   (Cosine Match Engine) |                     |  (Chunk Index & Top-K)  |
+------------+------------+                     +------------+------------+
             |                                               |
      [Score >= 0.85?]                                       |
       /            \                                        |
     YES             NO (Cache Miss)                         |
      |               \                                      |
      v                +----------------->-------------------+
[Return Cache]                                               |
Latency: <10ms                                               v
Cost: $0.00                                   +-----------------------------+
                                              | 3. Context Grounding Engine |
                                              +--------------+--------------+
                                                             |
                                                             v
                                              +-----------------------------+
                                              | 4. LLM Generation Engine    |
                                              | (Gemini 3.8 / OpenAI / Local)|
                                              +--------------+--------------+
                                                             |
                                                             v
                                              +-----------------------------+
                                              | 5. Conditional Cache Store  |
                                              | & Real-Time Telemetry Log   |
                                              +-----------------------------+
```

## 2. Core Mathematical Formula: Cosine Similarity
$$\text{Similarity}(u, v) = \frac{u \cdot v}{\|u\|_2 \|v\|_2} = \frac{\sum_{i=1}^d u_i v_i}{\sqrt{\sum_{i=1}^d u_i^2} \sqrt{\sum_{i=1}^d v_i^2}}$$

- **Range:** $[-1.0, 1.0]$, where values $\ge 0.85$ indicate close semantic congruence.
- **Normalization:** Vectors are L2 normalized to unit length so that inner product equals cosine similarity.

## 3. Cache Eviction & Invalidation Policies
1. **LRU (Least Recently Used):** Entries with lowest hit count and oldest `last_accessed_at` are eligible for eviction under memory bounds.
2. **TTL (Time To Live):** Volatile or time-decayed questions expire after `ttl_seconds`.
3. **Temporal Bypass:** Questions with dynamic qualifiers ("today", "current price", "latest") bypass cache lookup entirely.
4. **Manual & Bulk Eviction:** Individual key invalidation or whole-namespace wiping via UI or API.
