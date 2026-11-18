-- Allow anonymous/public (including server-side rendering and crawlers) to read PUBLISHED blog posts.
-- Drafts remain hidden from the anon role. Authenticated admin policy is unchanged.
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_can_read_published_blog_posts" ON public.blog_posts;
CREATE POLICY "public_can_read_published_blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO public
  USING (status = 'Published');
