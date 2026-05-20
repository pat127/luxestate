'use client';

import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  category: string;
  author: string;
  status: string;
  views: number;
  date: string;
  excerpt: string;
  featuredImage?: string;
  tags?: string[];
  metaTitle?: string;
  metaDesc?: string;
  publishDate?: string;
}

const BLOG_STORAGE_KEY = 'admin_blog_posts';

const initialPosts: BlogPost[] = [];

function loadPosts(): BlogPost[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(BLOG_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePosts(posts: BlogPost[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(posts));
}

const statusColors: Record<string, string> = {
  Published: 'text-emerald-400 bg-emerald-400/10',
  Draft: 'text-yellow-400 bg-yellow-400/10',
  Archived: 'text-muted-foreground bg-muted/50',
};

const categoryColors: Record<string, string> = {
  'Market Insights': 'text-primary bg-primary/10',
  'Off-Plan': 'text-blue-400 bg-blue-400/10',
  'Investment': 'text-purple-400 bg-purple-400/10',
  'Residential': 'text-emerald-400 bg-emerald-400/10',
  'Legal': 'text-orange-400 bg-orange-400/10',
  'Lifestyle': 'text-pink-400 bg-pink-400/10',
};

interface PostForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  author: string;
  featuredImage: string;
  tags: string;
  metaTitle: string;
  metaDesc: string;
  publishDate: string;
}

const emptyForm: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: 'Market Insights',
  status: 'Draft',
  author: 'Admin',
  featuredImage: '',
  tags: '',
  metaTitle: '',
  metaDesc: '',
  publishDate: '',
};

export default function BlogPostsPage() {
  const [posts, setPosts] = useState<BlogPost[]>(loadPosts());
  const [showModal, setShowModal] = useState(false);
  const [editPost, setEditPost] = useState<BlogPost | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<PostForm>(emptyForm);
  const [activeTab, setActiveTab] = useState<'content' | 'seo'>('content');
  const [importMsg, setImportMsg] = useState('');
  const csvInputRef = React.useRef<HTMLInputElement>(null);

  // Persist posts to localStorage whenever they change
  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  const categories = ['All', 'Market Insights', 'Off-Plan', 'Investment', 'Residential', 'Legal', 'Lifestyle'];

  const filtered = posts.filter((p) => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchSearch = search === '' || p.title.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });

  const openNew = () => {
    setEditPost(null);
    setForm(emptyForm);
    setActiveTab('content');
    setShowModal(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditPost(post);
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: '',
      category: post.category,
      status: post.status,
      author: post.author,
      featuredImage: post.featuredImage || '',
      tags: (post.tags || []).join(', '),
      metaTitle: post.metaTitle || '',
      metaDesc: post.metaDesc || '',
      publishDate: post.publishDate || '',
    });
    setActiveTab('content');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title) return;
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const tagList = form.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editPost) {
      setPosts(posts.map(p => p.id === editPost.id ? { ...p, title: form.title, slug, excerpt: form.excerpt, category: form.category, status: form.status, author: form.author, featuredImage: form.featuredImage, tags: tagList, metaTitle: form.metaTitle, metaDesc: form.metaDesc } : p));
    } else {
      setPosts([...posts, { id: Date.now(), title: form.title, slug, excerpt: form.excerpt, category: form.category, status: form.status, author: form.author, views: 0, date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), featuredImage: form.featuredImage, tags: tagList, metaTitle: form.metaTitle, metaDesc: form.metaDesc }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) { setImportMsg('CSV must have a header row and at least one data row.'); return; }

        // Parse header row — support quoted fields
        const parseRow = (row: string): string[] => {
          const result: string[] = [];
          let cur = '';
          let inQuote = false;
          for (let i = 0; i < row.length; i++) {
            const ch = row[i];
            if (ch === '"') { inQuote = !inQuote; }
            else if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; }
            else { cur += ch; }
          }
          result.push(cur.trim());
          return result;
        };

        const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''));

        // Field mapping: CSV header → BlogPost field
        const fieldMap: Record<string, keyof BlogPost | 'tags_str'> = {
          title: 'title',
          slug: 'slug',
          excerpt: 'excerpt',
          category: 'category',
          author: 'author',
          status: 'status',
          featured_image: 'featuredImage',
          featured_image_url: 'featuredImage',
          image: 'featuredImage',
          image_url: 'featuredImage',
          tags: 'tags_str',
          meta_title: 'metaTitle',
          seo_title: 'metaTitle',
          meta_description: 'metaDesc',
          meta_desc: 'metaDesc',
          seo_description: 'metaDesc',
          publish_date: 'publishDate',
          date: 'publishDate',
          views: 'views',
        };

        const imported: BlogPost[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseRow(lines[i]);
          if (values.every(v => !v)) continue;
          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

          const title = row['title'] || '';
          if (!title) continue;

          const slug = row['slug'] || title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
          const tagsRaw = row['tags'] || '';
          const tags = tagsRaw ? tagsRaw.split(/[;|]/).map(t => t.trim()).filter(Boolean) : [];

          const post: BlogPost = {
            id: Date.now() + i,
            title,
            slug,
            excerpt: row['excerpt'] || '',
            category: row['category'] || 'Market Insights',
            author: row['author'] || 'Admin',
            status: row['status'] || 'Draft',
            views: parseInt(row['views'] || '0', 10) || 0,
            date: row['publish_date'] || row['date'] || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            featuredImage: row['featured_image'] || row['featured_image_url'] || row['image'] || row['image_url'] || '',
            tags,
            metaTitle: row['meta_title'] || row['seo_title'] || '',
            metaDesc: row['meta_description'] || row['meta_desc'] || row['seo_description'] || '',
            publishDate: row['publish_date'] || row['date'] || '',
          };
          imported.push(post);
        }

        if (imported.length === 0) { setImportMsg('No valid rows found. Ensure CSV has a "title" column.'); return; }
        setPosts(prev => [...imported, ...prev]);
        setImportMsg(`✓ Imported ${imported.length} post${imported.length > 1 ? 's' : ''}`);
        setTimeout(() => setImportMsg(''), 4000);
      } catch {
        setImportMsg('Failed to parse CSV. Please check the file format.');
        setTimeout(() => setImportMsg(''), 4000);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-imported
    e.target.value = '';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts.length} total posts</p>
        </div>
        <div className="flex items-center gap-3">
          {importMsg && <span className={`text-xs font-semibold ${importMsg.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>{importMsg}</span>}
          <input ref={csvInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleCSVImport} />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <Icon name="ArrowUpTrayIcon" size={14} />
            Import CSV
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider hover:bg-accent transition-colors"
          >
            <Icon name="PlusIcon" size={14} />
            New Post
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: 'Published', value: posts.filter(p => p.status === 'Published').length, color: 'text-emerald-400' },
          { label: 'Drafts', value: posts.filter(p => p.status === 'Draft').length, color: 'text-yellow-400' },
          { label: 'Total Views', value: posts.reduce((s, p) => s + p.views, 0).toLocaleString(), color: 'text-primary' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          {['All', 'Published', 'Draft', 'Archived'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${filterStatus === s ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:text-foreground'}`}
            >
              {s}
            </button>
          ))}
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 bg-card border border-border text-xs text-muted-foreground focus:outline-none focus:border-primary/50"
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      {/* Posts list */}
      <div className="space-y-3">
        {filtered.map((post) => (
          <div key={post.id} className="bg-card border border-border p-4 hover:border-primary/20 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-foreground">{post.title}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${statusColors[post.status] || ''}`}>{post.status}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${categoryColors[post.category] || ''}`}>{post.category}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{post.excerpt}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Icon name="UserIcon" size={11} />{post.author}</span>
                  <span className="flex items-center gap-1"><Icon name="CalendarIcon" size={11} />{post.date}</span>
                  {post.views > 0 && <span className="flex items-center gap-1"><Icon name="EyeIcon" size={11} />{post.views.toLocaleString()} views</span>}
                  <span className="flex items-center gap-1 text-primary/60"><Icon name="LinkIcon" size={11} />/{post.slug}</span>
                  {post.tags && post.tags.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Icon name="TagIcon" size={11} />
                      {post.tags.slice(0, 3).join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Preview"><Icon name="EyeIcon" size={13} /></button>
                <button onClick={() => openEdit(post)} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors" title="Edit"><Icon name="PencilIcon" size={13} /></button>
                <button onClick={() => handleDelete(post.id)} className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors" title="Delete"><Icon name="TrashIcon" size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">No posts found</div>
        )}
      </div>

      {/* New/Edit Post Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{editPost ? 'Edit Post' : 'New Blog Post'}</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><Icon name="XMarkIcon" size={18} /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-border px-5">
              {(['content', 'seo'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 -mb-px transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {tab === 'content' ? 'Content' : 'SEO & Meta'}
                </button>
              ))}
            </div>

            <div className="p-5 space-y-4">
              {activeTab === 'content' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Post Title *</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        setForm({ ...form, title, slug });
                      }}
                      className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                      placeholder="Enter post title"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">URL Slug</label>
                    <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="post-url-slug" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Featured Image URL</label>
                    <input type="text" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="https://example.com/image.jpg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Excerpt</label>
                    <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Brief description of the post" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Content</label>
                    <textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Write your blog post content here..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Category</label>
                      <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                        <option>Market Insights</option><option>Off-Plan</option><option>Investment</option><option>Residential</option><option>Legal</option><option>Lifestyle</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Author</label>
                      <select value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                        <option>Admin</option><option>Sarah M.</option><option>James C.</option><option>Omar H.</option><option>Priya S.</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Status</label>
                      <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50">
                        <option>Draft</option><option>Published</option><option>Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Publish Date</label>
                      <input type="date" value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground focus:outline-none focus:border-primary/50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Tags (comma-separated)</label>
                    <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="e.g. Dubai, Investment, Off-Plan" />
                  </div>
                </>
              )}

              {activeTab === 'seo' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">SEO Title</label>
                    <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50" placeholder="SEO title (50-60 characters)" />
                    <p className="text-[10px] text-muted-foreground mt-1">{form.metaTitle.length}/60 characters</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Meta Description</label>
                    <textarea rows={3} value={form.metaDesc} onChange={(e) => setForm({ ...form, metaDesc: e.target.value })} className="w-full px-3 py-2.5 bg-input border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none" placeholder="Meta description (150-160 characters)" />
                    <p className="text-[10px] text-muted-foreground mt-1">{form.metaDesc.length}/160 characters</p>
                  </div>
                  <div className="bg-input border border-border p-4">
                    <p className="text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">Search Preview</p>
                    <p className="text-sm text-blue-400 font-medium">{form.metaTitle || form.title || 'Post Title'}</p>
                    <p className="text-xs text-emerald-400 mt-0.5">coveestate.com/blog/{form.slug || 'post-slug'}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.metaDesc || form.excerpt || 'Meta description will appear here...'}</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-border sticky bottom-0 bg-card">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-primary text-primary-foreground text-sm font-bold hover:bg-accent transition-colors">{editPost ? 'Update Post' : 'Publish Post'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
