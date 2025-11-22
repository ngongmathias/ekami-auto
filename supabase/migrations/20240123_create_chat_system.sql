-- Create chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id TEXT, -- Clerk user ID (nullable for anonymous users)
  user_email TEXT,
  user_name TEXT,
  session_id TEXT NOT NULL, -- For tracking anonymous users
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb -- For storing additional info like tokens used, model, etc.
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_timestamp();

-- Add RLS policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations
  FOR SELECT
  USING (
    user_id = auth.jwt() ->> 'sub' 
    OR session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
  );

-- Policy: Users can create conversations
CREATE POLICY "Users can create conversations"
  ON chat_conversations
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations
  FOR UPDATE
  USING (
    user_id = auth.jwt() ->> 'sub'
    OR session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
  );

-- Policy: Users can view messages in their conversations
CREATE POLICY "Users can view own messages"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (
        user_id = auth.jwt() ->> 'sub'
        OR session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
      )
    )
  );

-- Policy: Users can create messages in their conversations
CREATE POLICY "Users can create messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE id = conversation_id
      AND (
        user_id = auth.jwt() ->> 'sub'
        OR session_id = current_setting('request.jwt.claims', true)::json ->> 'session_id'
      )
    )
  );

-- Policy: Admins can view all conversations and messages
CREATE POLICY "Admins can view all conversations"
  ON chat_conversations
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

CREATE POLICY "Admins can view all messages"
  ON chat_messages
  FOR ALL
  USING (
    auth.jwt() ->> 'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Add comments
COMMENT ON TABLE chat_conversations IS 'Stores chat conversation sessions between users and AI chatbot';
COMMENT ON TABLE chat_messages IS 'Stores individual messages within chat conversations';
COMMENT ON COLUMN chat_conversations.session_id IS 'Unique session identifier for tracking anonymous users';
COMMENT ON COLUMN chat_conversations.status IS 'Conversation status: active, closed, or transferred to human';
COMMENT ON COLUMN chat_messages.role IS 'Message sender: user, assistant (AI), or system';
COMMENT ON COLUMN chat_messages.metadata IS 'Additional message metadata like tokens used, model version, etc.';
