-- Create RPC function to update user role
CREATE OR REPLACE FUNCTION public.update_user_role(user_id_param UUID, new_role_param TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow administrators to update roles
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'Administrator' THEN
    RAISE EXCEPTION 'Access denied. Only administrators can update user roles.';
  END IF;
  
  -- Update the user's role
  UPDATE public.profiles 
  SET role = new_role_param 
  WHERE id = user_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found.';
  END IF;
END;
$$;