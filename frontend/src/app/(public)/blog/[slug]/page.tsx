import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { BlogPost } from '@/types';
import { formatDate } from '@/lib/utils';

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await api.get(`/blog/${slug}`);
    return res.data;
  } catch { return null; }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="w-full h-72 object-cover rounded-lg mb-6" />
      )}
      {post.category && (
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">{post.category}</span>
      )}
      <h1 className="text-4xl font-bold text-dark mt-2 mb-4">{post.title}</h1>
      {post.published_at && (
        <p className="text-gray-400 text-sm mb-6">{formatDate(post.published_at)}</p>
      )}
      <div className="prose max-w-none text-dark" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
