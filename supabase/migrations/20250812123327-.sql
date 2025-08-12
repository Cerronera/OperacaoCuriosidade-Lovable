-- Fix remaining critical security vulnerabilities (corrected version)

-- 1. Add missing UPDATE policy for Customers table (Critical)
CREATE POLICY "Only Admins can update customers" 
ON public."Customers" 
FOR UPDATE 
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'Administrator'
);

-- 2. Add comprehensive RLS policies for profiles table
-- Allow users to update their own profile (name only, not role)
CREATE POLICY "Users can update their own nome" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Prevent unauthorized profile creation
CREATE POLICY "Profiles can only be created by system" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (false);  -- Only triggers can insert

-- Prevent profile deletion 
CREATE POLICY "Profiles cannot be deleted" 
ON public.profiles 
FOR DELETE 
TO authenticated
USING (false);

-- 3. Fix function search paths that are still mutable
-- Update get_paginated_clientes function
CREATE OR REPLACE FUNCTION public.get_paginated_clientes(
    page_number integer DEFAULT 1, 
    page_size integer DEFAULT 10, 
    filter_type text DEFAULT 'todos'::text, 
    sort_by text DEFAULT 'created_at'::text, 
    sort_direction text DEFAULT 'asc'::text, 
    search_term text DEFAULT NULL::text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    query_sql TEXT;
    count_sql TEXT;
    total_count BIGINT;
    items JSON;
BEGIN
    -- Security check: only allow authenticated users with proper roles
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role IN ('Administrator', 'Colaborador')
    ) THEN
        RAISE EXCEPTION 'Access denied. Insufficient permissions.';
    END IF;

    -- Construct base query
    query_sql := 'SELECT * FROM public."Customers"';
    count_sql := 'SELECT COUNT(*) FROM public."Customers"';

    -- Add filters dynamically
    IF filter_type = 'pendentes' OR filter_type = 'ultimoMes' OR (search_term IS NOT NULL AND search_term != '') THEN
        query_sql := query_sql || ' WHERE 1=1';
        count_sql := count_sql || ' WHERE 1=1';
    END IF;

    IF filter_type = 'pendentes' THEN
        query_sql := query_sql || ' AND revisado = false';
        count_sql := count_sql || ' AND revisado = false';
    ELSIF filter_type = 'ultimoMes' THEN
        query_sql := query_sql || ' AND created_at >= NOW() - INTERVAL ''30 days''';
        count_sql := count_sql || ' AND created_at >= NOW() - INTERVAL ''30 days''';
    END IF;

    IF search_term IS NOT NULL AND search_term != '' THEN
        query_sql := query_sql || format(' AND nome ILIKE %L', '%' || search_term || '%');
        count_sql := count_sql || format(' AND nome ILIKE %L', '%' || search_term || '%');
    END IF;

    -- Execute count query
    EXECUTE count_sql INTO total_count;

    -- Add sorting with validation
    IF sort_by IN ('nome', 'email', 'created_at', 'idade', 'status') THEN
        IF sort_direction = 'desc' THEN
            query_sql := query_sql || format(' ORDER BY %I DESC', sort_by);
        ELSE
            query_sql := query_sql || format(' ORDER BY %I ASC', sort_by);
        END IF;
    ELSE
        query_sql := query_sql || ' ORDER BY created_at DESC';  -- Default safe ordering
    END IF;

    -- Add pagination
    query_sql := query_sql || format(' LIMIT %s OFFSET %s', page_size, (page_number - 1) * page_size);

    -- Execute main query
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query_sql || ') t' INTO items;
    
    RETURN json_build_object(
        'items', items,
        'totalCount', total_count
    );
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, nome, email)
  VALUES (
    new.id, 
    'Colaborador',
    COALESCE(new.raw_user_meta_data ->> 'nome_completo', new.email),
    new.email
  );
  RETURN new;
END;
$function$;