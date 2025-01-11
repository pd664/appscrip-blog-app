// app/hero-section/page.js
import { supabaseService } from "../Editor/utils/supabase/supabaseService";
import { fetchFirstThreeImages } from "./helpers";
import Link from "next/link";
import Image from "next/image";

// Fetch posts and images at build time
export async function generateStaticParams() {
  try {
    const [posts, imageUrls] = await Promise.all([
      supabaseService.fetchEditorData(),
      fetchFirstThreeImages(),
    ]);

    if (!Array.isArray(posts)) {
      console.error("Posts is not an array:", posts);
      return { formattedTitles: [], imageUrls: [] };
    }

    const formattedTitles = posts.map((data) => ({
      id: data.id,
      title: data.title,
      year: data.created_at ? new Date(data.created_at).getFullYear() : '',
      slug: data.title.replace(/ /g, '-'),
    }));

    return {
      formattedTitles,
      imageUrls,
    };
  } catch (error) {
    console.error("Error fetching data for HeroSection:", error);
    return {
      formattedTitles: [],
      imageUrls: [],
    };
  }
}

export default async function HeroSection() {
  const { formattedTitles, imageUrls } = await generateStaticParams();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {formattedTitles.map((item) => (
        <div key={item.id} className="mb-8 group">
          <div className="flex items-baseline gap-3 hover:opacity-70 transition-opacity">
            <Link
              href={`/post/${item.slug}`}
              className="text-xl md:text-2xl font-medium text-gray-900 underline decoration-1 underline-offset-4"
            >
              {item.title}
            </Link>
            <span className="text-gray-500 text-sm whitespace-nowrap">
              {item.year}
            </span>
          </div>
        </div>
      ))}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {imageUrls.map((imageUrl, index) => (
          <div key={index} className="relative w-full h-64">
            <Image
              src={imageUrl}
              alt={`Image ${index + 1}`}
              layout="fill"
              objectFit="cover"
              className="rounded-lg shadow"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

HeroSection.revalidate = 10; // Revalidate every 60 seconds
