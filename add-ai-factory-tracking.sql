-- AI Factory Tracking Tables
-- Run this in your Supabase SQL Editor

-- Conversation logs for AI learning
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversation_logs') THEN
    CREATE TABLE conversation_logs (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
      session_id VARCHAR(255) NOT NULL,
      user_message TEXT NOT NULL,
      bot_response TEXT NOT NULL,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      menu_items_mentioned TEXT[],
      feedback_score INTEGER, -- -1 (negative), 0 (neutral), 1 (positive)
      conversation_completed BOOLEAN DEFAULT false,
      ip_address VARCHAR(45),
      user_agent TEXT
    );
  END IF;
END $$;

-- Response quality metrics
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'response_metrics') THEN
    CREATE TABLE response_metrics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
      session_id VARCHAR(255),
      response_time_ms INTEGER,
      user_satisfaction INTEGER, -- -1, 0, 1
      correction_applied BOOLEAN DEFAULT false,
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_logs_restaurant ON conversation_logs(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_timestamp ON conversation_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_conversation_logs_session ON conversation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_response_metrics_restaurant ON response_metrics(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_response_metrics_timestamp ON response_metrics(timestamp);

