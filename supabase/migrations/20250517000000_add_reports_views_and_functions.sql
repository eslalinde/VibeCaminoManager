-- Migration: Create views and functions for complex reports
-- This migration adds database views and functions to support complex reporting queries

-- ==============================================
-- VIEWS FOR REPORTS
-- ==============================================

-- View for catechist teams with all related information
CREATE OR REPLACE VIEW view_catechist_teams AS
SELECT 
    t.id as team_id,
    t.name as team_name,
    tt.name as team_type,
    c.number as community_number,
    p.name as parish_name,
    ci.name as city_name,
    COUNT(b.id) as members_count,
    COALESCE(responsible.person_name, 'Sin asignar') as responsible_name
FROM teams t
JOIN team_types tt ON t.team_type_id = tt.id
JOIN communities c ON t.community_id = c.id
JOIN parishes p ON c.parish_id = p.id
JOIN cities ci ON p.city_id = ci.id
LEFT JOIN belongs b ON t.id = b.team_id
LEFT JOIN (
    SELECT b2.team_id, p2.person_name
    FROM belongs b2
    JOIN people p2 ON b2.person_id = p2.id
    WHERE b2.is_responsible_for_the_team = true
) responsible ON t.id = responsible.team_id
WHERE tt.name = 'Catequistas'
GROUP BY t.id, t.name, tt.name, c.number, p.name, ci.name, responsible.person_name;

-- View for communities by parish with statistics
CREATE OR REPLACE VIEW view_communities_by_parish AS
SELECT 
    p.id as parish_id,
    p.name as parish_name,
    COALESCE(p.diocese, 'No especificado') as diocese,
    ci.name as city_name,
    COUNT(c.id) as communities_count,
    COALESCE(SUM(c.actual_brothers), 0) as total_brothers,
    CASE 
        WHEN COUNT(c.id) > 0 
        THEN ROUND(COALESCE(SUM(c.actual_brothers), 0)::numeric / COUNT(c.id), 2)
        ELSE 0 
    END as avg_brothers_per_community,
    STRING_AGG(DISTINCT sw.name, ', ') as step_ways_summary
FROM parishes p
JOIN cities ci ON p.city_id = ci.id
LEFT JOIN communities c ON p.id = c.parish_id
LEFT JOIN step_ways sw ON c.step_way_id = sw.id
GROUP BY p.id, p.name, p.diocese, ci.name
HAVING COUNT(c.id) > 0;

-- View for priests with parish and community information
CREATE OR REPLACE VIEW view_priests_report AS
SELECT 
    pr.id as priest_id,
    pe.person_name as priest_name,
    COALESCE(pe.phone, '-') as phone,
    COALESCE(pe.mobile, '-') as mobile,
    COALESCE(pe.email, '-') as email,
    pr.is_parish_priest,
    COALESCE(p.name, 'Sin parroquia asignada') as parish_name,
    COALESCE(p.diocese, 'No especificado') as diocese,
    COALESCE(ci.name, 'N/A') as city_name,
    COUNT(c.id) as communities_count
FROM priests pr
JOIN people pe ON pr.person_id = pe.id
LEFT JOIN parishes p ON pr.parish_id = p.id
LEFT JOIN cities ci ON p.city_id = ci.id
LEFT JOIN communities c ON p.id = c.parish_id
GROUP BY pr.id, pe.person_name, pe.phone, pe.mobile, pe.email, 
         pr.is_parish_priest, p.name, p.diocese, ci.name
ORDER BY pe.person_name;

-- ==============================================
-- FUNCTIONS FOR COMPLEX QUERIES
-- ==============================================

-- Function to get team statistics by parish
CREATE OR REPLACE FUNCTION get_team_stats_by_parish(parish_id_param bigint)
RETURNS TABLE (
    team_type_name text,
    teams_count bigint,
    total_members bigint,
    avg_members_per_team numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tt.name as team_type_name,
        COUNT(DISTINCT t.id) as teams_count,
        COUNT(b.id) as total_members,
        CASE 
            WHEN COUNT(DISTINCT t.id) > 0 
            THEN ROUND(COUNT(b.id)::numeric / COUNT(DISTINCT t.id), 2)
            ELSE 0 
        END as avg_members_per_team
    FROM teams t
    JOIN team_types tt ON t.team_type_id = tt.id
    JOIN communities c ON t.community_id = c.id
    LEFT JOIN belongs b ON t.id = b.team_id
    WHERE c.parish_id = parish_id_param
    GROUP BY tt.name
    ORDER BY teams_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get community progression statistics
CREATE OR REPLACE FUNCTION get_community_progression_stats()
RETURNS TABLE (
    step_way_name text,
    communities_count bigint,
    avg_brothers numeric,
    parishes_count bigint
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(sw.name, 'Sin etapa asignada') as step_way_name,
        COUNT(c.id) as communities_count,
        ROUND(AVG(c.actual_brothers), 2) as avg_brothers,
        COUNT(DISTINCT c.parish_id) as parishes_count
    FROM communities c
    LEFT JOIN step_ways sw ON c.step_way_id = sw.id
    GROUP BY sw.name
    ORDER BY communities_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get priest workload by parish
CREATE OR REPLACE FUNCTION get_priest_workload()
RETURNS TABLE (
    priest_name text,
    parish_name text,
    communities_count bigint,
    total_brothers bigint,
    is_parish_priest boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pe.person_name as priest_name,
        COALESCE(p.name, 'Sin parroquia') as parish_name,
        COUNT(c.id) as communities_count,
        COALESCE(SUM(c.actual_brothers), 0) as total_brothers,
        pr.is_parish_priest
    FROM priests pr
    JOIN people pe ON pr.person_id = pe.id
    LEFT JOIN parishes p ON pr.parish_id = p.id
    LEFT JOIN communities c ON p.id = c.parish_id
    GROUP BY pe.person_name, p.name, pr.is_parish_priest
    ORDER BY total_brothers DESC;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- RLS POLICIES FOR VIEWS
-- ==============================================

-- Enable RLS on views
ALTER VIEW view_catechist_teams SET (security_invoker = true);
ALTER VIEW view_communities_by_parish SET (security_invoker = true);
ALTER VIEW view_priests_report SET (security_invoker = true);

-- Grant permissions for authenticated users
GRANT SELECT ON view_catechist_teams TO authenticated;
GRANT SELECT ON view_communities_by_parish TO authenticated;
GRANT SELECT ON view_priests_report TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_team_stats_by_parish(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION get_community_progression_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION get_priest_workload() TO authenticated;
