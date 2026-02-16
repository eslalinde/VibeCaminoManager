-- Función RPC para fusionar dos comunidades
-- La comunidad "keep" permanece y absorbe los datos de la comunidad "remove"
-- Ejecuta todo en una transacción atómica (rollback automático si falla)

CREATE OR REPLACE FUNCTION merge_communities(
  p_keep_community_id BIGINT,    -- comunidad que permanece
  p_remove_community_id BIGINT   -- comunidad que se elimina
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_keep_community RECORD;
  v_remove_community RECORD;
  v_step_log_summary TEXT;
  v_brothers_moved INT := 0;
  v_members_moved INT := 0;
  v_keep_team_id BIGINT;
  v_remove_team RECORD;
BEGIN
  -- 1. Validaciones
  SELECT * INTO v_keep_community FROM communities WHERE id = p_keep_community_id;
  SELECT * INTO v_remove_community FROM communities WHERE id = p_remove_community_id;

  IF v_keep_community IS NULL THEN
    RAISE EXCEPTION 'Comunidad principal (id=%) no existe', p_keep_community_id;
  END IF;
  IF v_remove_community IS NULL THEN
    RAISE EXCEPTION 'Comunidad a eliminar (id=%) no existe', p_remove_community_id;
  END IF;
  IF p_keep_community_id = p_remove_community_id THEN
    RAISE EXCEPTION 'No se puede fusionar una comunidad consigo misma';
  END IF;

  -- 2. Construir resumen de bitácora de la comunidad a eliminar
  SELECT STRING_AGG(
    FORMAT('[%s] %s - %s: %s',
      COALESCE(csl.date_of_step::TEXT, 'Sin fecha'),
      COALESCE(sw.name, 'Sin etapa'),
      CASE WHEN csl.outcome THEN 'Aprobado' ELSE 'No aprobado' END,
      COALESCE(csl.notes, '')
    ), E'\n' ORDER BY csl.date_of_step
  ) INTO v_step_log_summary
  FROM community_step_log csl
  LEFT JOIN step_ways sw ON csl.step_way_id = sw.id
  WHERE csl.community_id = p_remove_community_id;

  -- 3. Crear entrada en step_log de la comunidad principal con el historial
  INSERT INTO community_step_log (community_id, date_of_step, notes)
  VALUES (
    p_keep_community_id,
    CURRENT_DATE,
    FORMAT('FUSIÓN: Se absorbió la Comunidad %s. Hermanos actuales: %s. ' ||
           E'\n--- Bitácora de la comunidad fusionada ---\n%s',
      v_remove_community.number,
      COALESCE(v_remove_community.actual_brothers, 0),
      COALESCE(v_step_log_summary, 'Sin registros')
    )
  );

  -- 4. Mover hermanos (evitando duplicados)
  WITH moved AS (
    UPDATE brothers
    SET community_id = p_keep_community_id
    WHERE community_id = p_remove_community_id
      AND person_id NOT IN (
        SELECT person_id FROM brothers WHERE community_id = p_keep_community_id
      )
    RETURNING id
  )
  SELECT COUNT(*) INTO v_brothers_moved FROM moved;

  -- Eliminar hermanos duplicados que quedaron en la comunidad a eliminar
  DELETE FROM brothers WHERE community_id = p_remove_community_id;

  -- 5. Mover miembros de equipos (Responsables y Catequistas)
  FOR v_remove_team IN
    SELECT * FROM teams WHERE community_id = p_remove_community_id
  LOOP
    -- Buscar equipo del mismo tipo en la comunidad principal
    SELECT id INTO v_keep_team_id
    FROM teams
    WHERE community_id = p_keep_community_id
      AND team_type_id = v_remove_team.team_type_id
    LIMIT 1;

    IF v_keep_team_id IS NOT NULL THEN
      -- Mover miembros al equipo destino (evitando duplicados)
      WITH moved AS (
        UPDATE belongs
        SET team_id = v_keep_team_id,
            community_id = p_keep_community_id,
            is_responsible_for_the_team = false  -- pierden el rol de responsable
        WHERE team_id = v_remove_team.id
          AND person_id NOT IN (
            SELECT person_id FROM belongs WHERE team_id = v_keep_team_id
          )
        RETURNING id
      )
      SELECT v_members_moved + COUNT(*) INTO v_members_moved FROM moved;
    END IF;

    -- Limpiar miembros restantes (duplicados) del equipo a eliminar
    DELETE FROM belongs WHERE team_id = v_remove_team.id;
    -- Limpiar parish_teams del equipo a eliminar
    DELETE FROM parish_teams WHERE team_id = v_remove_team.id;
  END LOOP;

  -- 6. Eliminar step_logs de la comunidad a eliminar
  DELETE FROM community_step_log WHERE community_id = p_remove_community_id;

  -- 7. Limpiar referencia cathechist_team_id si apunta a un team que se va a eliminar
  UPDATE communities
  SET cathechist_team_id = NULL
  WHERE id = p_remove_community_id AND cathechist_team_id IS NOT NULL;

  -- 8. Eliminar equipos de la comunidad a eliminar
  DELETE FROM teams WHERE community_id = p_remove_community_id;

  -- 9. Eliminar la comunidad
  DELETE FROM communities WHERE id = p_remove_community_id;

  -- 10. Recalcular números ordinales en la parroquia de la comunidad eliminada
  IF v_remove_community.parish_id IS NOT NULL THEN
    WITH numbered AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY number::int) as new_number
      FROM communities
      WHERE parish_id = v_remove_community.parish_id
    )
    UPDATE communities c
    SET number = n.new_number::text
    FROM numbered n
    WHERE c.id = n.id
      AND c.number != n.new_number::text;
  END IF;

  -- 11. Actualizar actual_brothers de la comunidad principal
  UPDATE communities
  SET actual_brothers = (
    SELECT COUNT(*) FROM brothers WHERE community_id = p_keep_community_id
  )
  WHERE id = p_keep_community_id;

  RETURN json_build_object(
    'success', true,
    'brothers_moved', v_brothers_moved,
    'members_moved', v_members_moved,
    'removed_community_number', v_remove_community.number
  );
END;
$$;

-- Permisos: solo usuarios autenticados (RLS en la función con SECURITY DEFINER)
GRANT EXECUTE ON FUNCTION merge_communities(BIGINT, BIGINT) TO authenticated;
