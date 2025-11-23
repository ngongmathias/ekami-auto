import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateBlogPages() {
  console.log('🚀 Generating static blog pages for social sharing...');

  try {
    // Fetch all published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published');

    if (error) {
      console.error('❌ Error fetching blog posts:', error);
      return;
    }

    if (!posts || posts.length === 0) {
      console.log('⚠️  No published blog posts found');
      return;
    }

    console.log(`📝 Found ${posts.length} published posts`);

    // Create output directory
    const outputDir = path.join(__dirname, '..', 'public', 'blog-static');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log('📁 Created output directory:', outputDir);
    }

    // Generate HTML for each post
    let successCount = 0;
    for (const post of posts) {
      try {
        const html = generatePostHTML(post);
        const filename = `${post.slug}.html`;
        const filepath = path.join(outputDir, filename);
        
        fs.writeFileSync(filepath, html);
        successCount++;
        console.log(`✅ Generated: ${filename}`);
      } catch (err) {
        console.error(`❌ Error generating ${post.slug}:`, err.message);
      }
    }

    console.log(`\n🎉 Successfully generated ${successCount}/${posts.length} static pages!`);
    console.log('📍 Location: public/blog-static/');
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

function generatePostHTML(post) {
  const title = escapeHtml(post.meta_title || post.title);
  const description = escapeHtml(post.meta_description || post.excerpt);
  const image = post.featured_image || 'https://ekamiauto.com/logo.jpg';
  const url = `https://ekamiauto.com/blog/${post.slug}`;
  const siteName = 'Ekami Auto';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="${siteName}">
  <meta property="og:locale" content="en_US">
  <meta property="article:published_time" content="${post.published_at || post.created_at}">
  <meta property="article:author" content="${siteName}">
  <meta property="article:section" content="${post.category}">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:site" content="@EkamiAuto">
  
  <!-- LinkedIn -->
  <meta property="og:image:alt" content="${title}">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${url}">
  
  <!-- Redirect to SPA after meta tags are read -->
  <script>
    // Wait a tiny bit for crawlers to read meta tags, then redirect
    setTimeout(function() {
      window.location.href = '${url}';
    }, 100);
  </script>
  
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    h1 {
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    .meta {
      color: #666;
      font-size: 14px;
      margin-bottom: 20px;
    }
    .excerpt {
      font-size: 18px;
      color: #555;
      margin-bottom: 20px;
    }
    .loading {
      text-align: center;
      color: #999;
      margin-top: 40px;
    }
    img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <article>
    ${post.featured_image ? `<img src="${post.featured_image}" alt="${title}">` : ''}
    <h1>${title}</h1>
    <div class="meta">
      ${post.category ? `<span>${post.category}</span> • ` : ''}
      ${new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
    <div class="excerpt">${description}</div>
  </article>
  
  <div class="loading">
    <p>Loading full article...</p>
  </div>
  
  <noscript>
    <p>Please enable JavaScript to view the full article.</p>
    <p><a href="${url}">Click here to continue</a></p>
  </noscript>
</body>
</html>`;
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Run the generator
generateBlogPages();
