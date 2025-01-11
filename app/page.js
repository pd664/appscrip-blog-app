import HomeComp from './components/Home/Home';
import Head from 'next/head';

export default function Home() {
  const metaDescription = "This is my blog where I share my thoughts and what’s running in the environment. Stay updated with my ideas and insights!";
  
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "My Thoughts and What’s Running in the Environment",
    "description": metaDescription,
    "author": {
      "@type": "Person",
      "name": "Prateek"
    },
    "datePublished": "2025-01-10", // Set current date or the date when the post is published
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://your-website.com/blog"
    }
  };
  return (
    <div className="container w-100">
      <Head>
      <title>My Thoughts and What’s Running in the Environment</title>
      <meta name="description" content={metaDescription} />
      <script type="application/ld+json">{JSON.stringify(blogSchema)}</script>

      </Head>
      <HomeComp />
    </div>
  );
}
