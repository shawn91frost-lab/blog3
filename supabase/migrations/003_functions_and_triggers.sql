-- ==============================================================================
-- Migration 003: Functions, Triggers & Search Indexing for NexusBlog
-- ==============================================================================

-- 1. Full Text Search Vector Generation Trigger
CREATE OR REPLACE FUNCTION update_post_search_vector() RETURNS trigger AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.raw_html_content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_search_vector ON public.posts;
CREATE TRIGGER trg_posts_search_vector
    BEFORE INSERT OR UPDATE OF title, excerpt, raw_html_content
    ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION update_post_search_vector();

-- 2. Reading Time Calculation Trigger (approx 200 words per minute)
CREATE OR REPLACE FUNCTION calculate_reading_time() RETURNS trigger AS $$
DECLARE
    word_count INTEGER;
BEGIN
    word_count := array_length(regexp_split_to_array(COALESCE(NEW.raw_html_content, NEW.excerpt, ''), '\s+'), 1);
    NEW.reading_time := GREATEST(1, ROUND(word_count / 200.0));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_reading_time ON public.posts;
CREATE TRIGGER trg_posts_reading_time
    BEFORE INSERT OR UPDATE OF raw_html_content, excerpt
    ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION calculate_reading_time();

-- 3. Stored Procedure to Increment Post Views safely
CREATE OR REPLACE FUNCTION increment_post_views(post_slug VARCHAR) RETURNS void AS $$
BEGIN
    UPDATE public.posts
    SET views = views + 1
    WHERE slug = post_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
