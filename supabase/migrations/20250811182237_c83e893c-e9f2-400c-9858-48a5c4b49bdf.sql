-- Fix critical security issue: Replace overly permissive Customer RLS policies with role-based access

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public."Customers";
DROP POLICY IF EXISTS "enable update for authenticated users" ON public."Customers";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public."Customers";

-- Create secure role-based policies for Customers table
-- Administrators: Full access to all customer data
CREATE POLICY "Administrators can view all customers" 
ON public."Customers" 
FOR SELECT 
USING (get_my_role() = 'Administrator');

CREATE POLICY "Administrators can insert customers" 
ON public."Customers" 
FOR INSERT 
WITH CHECK (get_my_role() = 'Administrator');

CREATE POLICY "Administrators can update customers" 
ON public."Customers" 
FOR UPDATE 
USING (get_my_role() = 'Administrator') 
WITH CHECK (get_my_role() = 'Administrator');

-- Colaboradores: Read-only access to customer data
CREATE POLICY "Colaboradores can view customers" 
ON public."Customers" 
FOR SELECT 
USING (get_my_role() = 'Colaborador');

-- Fix database function security warnings by setting search_path
CREATE OR REPLACE FUNCTION public.padronizar_nome()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    excecoes TEXT[] := ARRAY['de', 'da', 'do', 'das', 'dos'];
    palavra TEXT;
    nome_padronizado TEXT := '';
    partes_nome TEXT[];
BEGIN
    -- Se o nome for nulo, não faz nada
    IF NEW.nome IS NULL THEN
        RETURN NEW;
    END IF;

    -- Converte o nome para minúsculo e divide em palavras
    partes_nome := string_to_array(lower(NEW.nome), ' ');

    -- Itera sobre cada palavra
    FOREACH palavra IN ARRAY partes_nome
    LOOP
        -- Se a palavra não estiver na lista de exceções, capitaliza a primeira letra
        IF NOT (palavra = ANY(excecoes)) THEN
            palavra := upper(substring(palavra, 1, 1)) || substring(palavra, 2);
        END IF;
        
        nome_padronizado := nome_padronizado || ' ' || palavra;
    END LOOP;

    -- Atribui o nome formatado de volta ao registro que será salvo
    NEW.nome := trim(nome_padronizado);
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_paginated_clientes(page_number integer DEFAULT 1, page_size integer DEFAULT 10, filter_type text DEFAULT 'todos'::text, sort_by text DEFAULT 'created_at'::text, sort_direction text DEFAULT 'asc'::text, search_term text DEFAULT NULL::text)
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
    -- Constrói a base da consulta
    query_sql := 'SELECT * FROM public."Customers"';
    count_sql := 'SELECT COUNT(*) FROM public."Customers"';

    -- Adiciona os filtros (cláusula WHERE) dinamicamente
    IF filter_type = 'pendentes' OR filter_type = 'ultimoMes' OR (search_term IS NOT NULL AND search_term != '') THEN
        query_sql := query_sql || ' WHERE 1=1'; -- Inicia a cláusula WHERE
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
        -- Usa format() com %L para proteger contra SQL Injection
        query_sql := query_sql || format(' AND nome ILIKE %L', '%' || search_term || '%');
        count_sql := count_sql || format(' AND nome ILIKE %L', '%' || search_term || '%');
    END IF;

    -- Executa a consulta de contagem PRIMEIRO, com os filtros aplicados
    EXECUTE count_sql INTO total_count;

    -- Adiciona a ordenação dinamicamente
    -- Usa format() com %I para identificar colunas de forma segura
    IF sort_by IS NOT NULL THEN
        IF sort_direction = 'desc' THEN
            query_sql := query_sql || format(' ORDER BY %I DESC', sort_by);
        ELSE
            query_sql := query_sql || format(' ORDER BY %I ASC', sort_by);
        END IF;
    END IF;

    -- Adiciona a paginação dinamicamente
    query_sql := query_sql || format(' LIMIT %s OFFSET %s', page_size, (page_number - 1) * page_size);

    -- Executa a consulta principal para obter os itens da página
    EXECUTE 'SELECT COALESCE(json_agg(t), ''[]''::json) FROM (' || query_sql || ') t' INTO items;

    -- Retorna o objeto JSON final
    RETURN json_build_object(
        'items', items,
        'totalCount', total_count
    );
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$SELECT json_build_object(
  'total_count',   (SELECT COUNT(*) FROM public."Customers"),
  'recent_count',  (SELECT COUNT(*) FROM public."Customers" WHERE created_at >= NOW() - INTERVAL '30 days'),
  'pending_count', (SELECT COUNT(*) FROM public."Customers" WHERE revisado = false)
);$function$;