# dailer

## Production-ready folder structure

```text
.
├── apps/
│   ├── api/                         # Core backend APIs (campaigns, contacts, call orchestration)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── businesses/
│   │   │   │   ├── campaigns/
│   │   │   │   ├── contacts/
│   │   │   │   ├── calls/
│   │   │   │   ├── analytics/
│   │   │   │   └── compliance/
│   │   │   ├── adapters/
│   │   │   │   ├── twilio/
│   │   │   │   ├── deepgram/
│   │   │   │   ├── elevenlabs/
│   │   │   │   ├── llm/
│   │   │   │   └── vector-db/
│   │   │   ├── jobs/
│   │   │   │   ├── dialer-worker/
│   │   │   │   ├── transcription-worker/
│   │   │   │   └── summarization-worker/
│   │   │   ├── realtime/
│   │   │   │   ├── ws-gateway/
│   │   │   │   └── media-stream-bridge/
│   │   │   ├── rag/
│   │   │   │   ├── ingestion/
│   │   │   │   ├── indexing/
│   │   │   │   └── retrieval/
│   │   │   ├── config/
│   │   │   └── main.(ts|py|go)
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── contract/
│   │   └── Dockerfile
│   │
│   ├── web/                         # Admin dashboard (campaign setup, call review, analytics)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   │   ├── campaigns/
│   │   │   │   ├── calls/
│   │   │   │   ├── contacts/
│   │   │   │   └── reports/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── tests/
│   │   └── Dockerfile
│   │
│   └── ops-console/                 # Internal tool for support/manual call takeover
│       ├── src/
│       └── Dockerfile
│
├── packages/
│   ├── shared-types/                # Shared DTOs/events/schema validation
│   ├── prompt-library/              # Prompt templates, guardrails, personas
│   ├── call-flows/                  # Reusable conversation state machine definitions
│   ├── sdk/                         # Internal SDK clients for microservices
│   └── ui-kit/                      # Shared UI components
│
├── services/
│   ├── ingestion-service/           # Parse PDFs/URLs/reports into normalized docs
│   ├── rag-service/                 # Chunking, embedding, retrieval APIs
│   ├── dialer-service/              # Queueing, rate limits, retry, parallel dialing
│   ├── realtime-voice-service/      # STT/LLM/TTS orchestration loop
│   ├── scoring-service/             # Lead scoring, sentiment, quality metrics
│   └── notification-service/        # Email/SMS/webhook notifications
│
├── infra/
│   ├── terraform/
│   │   ├── envs/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── modules/
│   │       ├── networking/
│   │       ├── database/
│   │       ├── redis/
│   │       ├── object-storage/
│   │       ├── queue/
│   │       └── observability/
│   ├── kubernetes/
│   │   ├── base/
│   │   └── overlays/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   └── docker/
│       ├── compose.dev.yml
│       └── compose.observability.yml
│
├── data/
│   ├── seed/
│   ├── fixtures/
│   └── migrations/
│
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md
│   │   ├── realtime-call-flow.md
│   │   ├── rag-design.md
│   │   └── multi-tenant-security.md
│   ├── product/
│   │   ├── campaign-lifecycle.md
│   │   └── personalization-spec.md
│   ├── compliance/
│   │   ├── tcpa-checklist.md
│   │   ├── consent-model.md
│   │   └── data-retention.md
│   ├── runbooks/
│   │   ├── incident-response.md
│   │   ├── degraded-voice-latency.md
│   │   └── provider-failover.md
│   └── adr/                         # Architecture Decision Records
│
├── scripts/
│   ├── dev/
│   ├── ci/
│   ├── release/
│   └── one-off/
│
├── tests/
│   ├── e2e/
│   ├── load/
│   ├── chaos/
│   └── synthetic-call-scenarios/
│
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   ├── cd.yml
│   │   ├── security-scan.yml
│   │   └── load-test.yml
│   ├── CODEOWNERS
│   └── pull_request_template.md
│
├── .env.example
├── Makefile
├── pnpm-workspace.yaml / turbo.json / nx.json
└── README.md
```

## Recommended conventions

- Keep all provider integration logic in `apps/api/src/adapters/` so Twilio/Deepgram/ElevenLabs can be swapped with minimal impact.
- Keep RAG as its own service boundary (`services/rag-service`) to isolate embedding/index costs and make retrieval reusable across voice and dashboard features.
- Store prompt templates in `packages/prompt-library` and version them like code.
- Keep compliance docs and policy logic in a dedicated module and documented in `docs/compliance/`.
- Treat realtime voice orchestration (`services/realtime-voice-service`) as latency-critical and independent from campaign CRUD APIs.
