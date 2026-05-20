import Link from 'next/link';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';

async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const res = await api.get('/blog?status=published');
    return res.data.data ?? [];
  } catch { return []; }
}

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-dark mb-8">Blogue</h1>
      {posts.length === 0 ? (
        <p className="text-gray-500">Aucun article disponible.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group">
              <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                {post.cover_image_url && (
                  <img src={post.cover_image_url} alt={post.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide">{post.category}</span>
                  )}
                  <h2 className="text-lg font-bold text-dark mt-1 group-hover:text-primary transition-colors">{post.title}</h2>
                  {post.excerpt && <p className="text-gray-600 text-sm mt-2 line-clamp-3">{post.excerpt}</p>}
                  {post.published_at && (
                    <p className="text-xs text-gray-400 mt-3">{formatDate(post.published_at)}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
