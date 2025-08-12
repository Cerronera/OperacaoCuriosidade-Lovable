-- Check and fix Customer RLS policies - handle existing policies gracefully

-- Drop existing policies that need to be replaced
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Customers";
DROP POLICY IF EXISTS "enable update for authenticated users" ON public."Customers";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."Customers";

-- Check if policies already exist and create them only if they don't
DO $$
BEGIN
    -- Create Administrator view policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Customers' 
        AND policyname = 'Administrators can view all customers'
    ) THEN
        EXECUTE 'CREATE POLICY "Administrators can view all customers" 
                 ON public."Customers" 
                 FOR SELECT 
                 USING (get_my_role() = ''Administrator'')';
    END IF;

    -- Create Administrator insert policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Customers' 
        AND policyname = 'Administrators can insert customers'
    ) THEN
        EXECUTE 'CREATE POLICY "Administrators can insert customers" 
                 ON public."Customers" 
                 FOR INSERT 
                 WITH CHECK (get_my_role() = ''Administrator'')';
    END IF;

    -- Create Administrator update policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Customers' 
        AND policyname = 'Administrators can update customers'
    ) THEN
        EXECUTE 'CREATE POLICY "Administrators can update customers" 
                 ON public."Customers" 
                 FOR UPDATE 
                 USING (get_my_role() = ''Administrator'') 
                 WITH CHECK (get_my_role() = ''Administrator'')';
    END IF;

    -- Create Colaborador view policy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Customers' 
        AND policyname = 'Colaboradores can view customers'
    ) THEN
        EXECUTE 'CREATE POLICY "Colaboradores can view customers" 
                 ON public."Customers" 
                 FOR SELECT 
                 USING (get_my_role() = ''Colaborador'')';
    END IF;
END
$$;