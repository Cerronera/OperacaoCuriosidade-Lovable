-- Fix remaining functions with mutable search_path

-- Fix update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(user_id_param uuid, new_role_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF (SELECT role FROM public.profiles WHERE id = auth.uid()) != 'Administrator' THEN
    RAISE EXCEPTION 'Access denied. Only administrators can update user roles.';
  END IF;
  
  UPDATE public.profiles
  SET role = new_role_param
  WHERE id = user_id_param;
END;
$function$;

-- Fix get_my_role function
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$function$;

-- Fix get_dashboard_stats function
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT json_build_object(
    'total_count',   (SELECT COUNT(*) FROM public."Customers"),
    'recent_count',  (SELECT COUNT(*) FROM public."Customers" WHERE created_at >= NOW() - INTERVAL '30 days'),
    'pending_count', (SELECT COUNT(*) FROM public."Customers" WHERE revisado = false)
  );
$function$;

-- Fix padronizar_nome function
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