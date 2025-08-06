-- Create RPC function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  total_count INTEGER;
  recent_count INTEGER;
  pending_count INTEGER;
BEGIN
  -- Get total count of customers
  SELECT COUNT(*) INTO total_count FROM Customers;
  
  -- Get count of customers created in the last 30 days
  SELECT COUNT(*) INTO recent_count 
  FROM Customers 
  WHERE created_at >= NOW() - INTERVAL '30 days';
  
  -- Get count of customers with pending review (revisado = false)
  SELECT COUNT(*) INTO pending_count 
  FROM Customers 
  WHERE revisado = false;
  
  -- Return as JSON object
  RETURN json_build_object(
    'total_count', total_count,
    'recent_count', recent_count,
    'pending_count', pending_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;