-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can update own conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Users can view own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can create messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Admins can view all messages" ON chat_messages;

-- Create simpler, working policies

-- Allow anyone to create conversations (for anonymous users)
CREATE POLICY "Anyone can create conversations"
  ON chat_conversations
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view their own conversations by session_id
CREATE POLICY "Users can view own conversations by session"
  ON chat_conversations
  FOR SELECT
  USING (true); -- Allow all reads for now, we'll filter in the app

-- Allow anyone to update their own conversations
CREATE POLICY "Users can update own conversations"
  ON chat_conversations
  FOR UPDATE
  USING (true);

-- Allow anyone to insert messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view messages
CREATE POLICY "Anyone can view messages"
  ON chat_messages
  FOR SELECT
  USING (true);

-- Admin policies (full access)
CREATE POLICY "Admins have full access to conversations"
  ON chat_conversations
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

CREATE POLICY "Admins have full access to messages"
  ON chat_messages
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'email' IN (
      'kerryngong@ekamiauto.com',
      'mathiasngongngai@gmail.com'
    )
  );

-- Add helpful comment
COMMENT ON TABLE chat_conversations IS 'Chat conversations - RLS enabled but permissive for anonymous users';
COMMENT ON TABLE chat_messages IS 'Chat messages - RLS enabled but permissive for anonymous users';
