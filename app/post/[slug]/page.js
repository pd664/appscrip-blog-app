// app/post/[slug]/page.js
import Image from "next/image";
import { supabaseService } from "@/app/components/Editor/utils/supabase/supabaseService";
import { notFound } from "next/navigation";

// Fetch the post by slug
async function getPostBySlug(slug) {
  try {
    console.log("trying", slug)
    const titleFromSlug = slug.replace(/-/g, " ");
    const { data: post, error } = await supabaseService.supabase
      .from("editor_data")
      .select("*")
      .ilike("title", titleFromSlug) // Case-insensitive match
      .single();

    if (error) {
      console.error("Error fetching post:", error);
      return null;
    }

    return post;
  } catch (error) {
    console.error("Error in getPostBySlug:", error);
    return null;
  }
}

// This function generates static params for the dynamic routes (slugs)
export async function generateStaticParams() {
  const { data: posts } = await supabaseService.supabase
    .from("editor_data")
    .select("title");

  const paths = posts.map((post) => ({
    slug: post.title.replace(/ /g, "-"),
  }));

  return paths.map((path) => ({
    params: path,
  }));
}

// Fetch post data for each slug during build and enable ISR
export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return notFound(); // Automatically returns a 404 if the post isn't found
  }

  const htmlContent = post.content?.content || "";

  return (
    <div>
      <article className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">{post.title}</h1>

        {post.image_url && (
          <div className="relative aspect-video mb-6">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw"
              priority
              className="object-cover rounded-lg"
              loading="eager"
            />
          </div>
        )}

        <div
          className="prose prose-lg py-5 max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>
    </div>
  );
}

PostPage.revalidate = 2; 
