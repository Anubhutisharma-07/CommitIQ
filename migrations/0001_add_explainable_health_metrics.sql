ALTER TABLE health_snapshots ADD COLUMN risk_reasons_json TEXT;
ALTER TABLE health_snapshots ADD COLUMN hotspot_persistence_score FLOAT DEFAULT 0.0 NOT NULL;
ALTER TABLE health_snapshots ADD COLUMN persistent_hotspots_json TEXT;
