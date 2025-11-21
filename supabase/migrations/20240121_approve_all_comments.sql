-- Approve all existing pending comments
UPDATE blog_comments 
SET 
  status = 'approved',
  approved_at = COALESCE(approved_at, NOW())
WHERE status = 'pending';
