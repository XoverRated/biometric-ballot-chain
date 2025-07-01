
-- Add blockchain-related columns to votes table
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS block_number INTEGER,
ADD COLUMN IF NOT EXISTS blockchain_timestamp TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS blockchain_hash TEXT;

-- Add index for faster blockchain hash lookups
CREATE INDEX IF NOT EXISTS idx_votes_blockchain_hash ON votes(blockchain_hash);
CREATE INDEX IF NOT EXISTS idx_votes_verification_code ON votes(verification_code);
