-- GALERIA-VOTO-001 — Cloudflare D1
CREATE TABLE IF NOT EXISTS ballots (
 gallery_id TEXT NOT NULL,
 voter_id TEXT NOT NULL,
 first_id TEXT NOT NULL,
 second_id TEXT NOT NULL,
 third_id TEXT NOT NULL,
 updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
 PRIMARY KEY (gallery_id, voter_id)
);
CREATE INDEX IF NOT EXISTS idx_ballots_gallery ON ballots(gallery_id);
