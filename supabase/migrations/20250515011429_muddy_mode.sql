/*
  # Add vote tracking and polling features

  1. New Tables
    - `vote_counts`
      - `id` (uuid, primary key)
      - `election_id` (references elections)
      - `candidate_id` (references candidates)
      - `vote_count` (integer)
      - `last_updated` (timestamp)
    
    - `poll_stations`
      - `id` (uuid, primary key) 
      - `election_id` (references elections)
      - `total_votes` (integer)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on new tables
    - Add policies for read access to authenticated users
    - Add policies for write access to system only
*/

-- Create vote counts table
CREATE TABLE IF NOT EXISTS vote_counts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) NOT NULL,
  candidate_id uuid REFERENCES candidates(id) NOT NULL,
  vote_count integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(election_id, candidate_id)
);

-- Create poll stations table
CREATE TABLE IF NOT EXISTS poll_stations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id uuid REFERENCES elections(id) NOT NULL,
  total_votes integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(election_id)
);

-- Enable RLS
ALTER TABLE vote_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_stations ENABLE ROW LEVEL SECURITY;

-- Policies for vote_counts
CREATE POLICY "Allow read access to authenticated users for vote counts"
  ON vote_counts
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for poll_stations  
CREATE POLICY "Allow read access to authenticated users for poll stations"
  ON poll_stations
  FOR SELECT
  TO authenticated
  USING (true);