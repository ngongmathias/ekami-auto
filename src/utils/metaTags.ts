// Utility to update meta tags for social sharing

export interface MetaTagsConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: string;
}

export function updateMetaTags(config: MetaTagsConfig) {
  const {
    title,
    description,
    image = 'https://ekamiauto.com/logo.jpg',
    url = window.location.href,
    type = 'article'
  } = config;

  // Update document title
  document.title = title;

  // Update or create meta tags
  updateMetaTag('description', description);
  
  // Open Graph tags
  updateMetaTag('og:type', type, 'property');
  updateMetaTag('og:url', url, 'property');
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', description, 'property');
  updateMetaTag('og:image', image, 'property');
  
  // Twitter tags
  updateMetaTag('twitter:card', 'summary_large_image', 'property');
  updateMetaTag('twitter:url', url, 'property');
  updateMetaTag('twitter:title', title, 'property');
  updateMetaTag('twitter:description', description, 'property');
  updateMetaTag('twitter:image', image, 'property');
  
  // LinkedIn uses Open Graph tags, but we can add article-specific ones
  if (type === 'article') {
    updateMetaTag('og:site_name', 'Ekami Auto', 'property');
    updateMetaTag('article:publisher', 'https://ekamiauto.com', 'property');
  }
}

function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name') {
  // Try to find existing tag
  let element = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (element) {
    // Update existing tag
    element.setAttribute('content', content);
  } else {
    // Create new tag
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    element.setAttribute('content', content);
    document.head.appendChild(element);
  }
}

export function resetMetaTags() {
  // Reset to default site meta tags
  updateMetaTags({
    title: 'Ekami Auto - Car Rentals, Sales & Repairs in Cameroon',
    description: 'Smart car rentals, sales & repairs in Cameroon. Book, buy, or repair your car with AI-powered assistance.',
    image: 'https://ekamiauto.com/logo.jpg',
    url: 'https://ekamiauto.com/',
    type: 'website'
  });
}
