UPDATE public.blog_posts
SET author = 'Sherry'
WHERE author IS DISTINCT FROM 'Sherry';
