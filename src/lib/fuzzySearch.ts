/**
 * Fuzzy Search Utility
 * Handles typo-tolerant searching for car makes, models, and features
 */

/**
 * Calculate Levenshtein distance between two strings
 * (measures how many single-character edits are needed)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarityScore(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - distance) / longer.length;
}

/**
 * Check if query matches text with fuzzy matching
 */
export function fuzzyMatch(query: string, text: string, threshold: number = 0.6): boolean {
  if (!query || !text) return false;
  
  const queryLower = query.toLowerCase().trim();
  const textLower = text.toLowerCase().trim();
  
  // Exact match
  if (textLower.includes(queryLower)) return true;
  
  // Check similarity score
  const score = similarityScore(queryLower, textLower);
  return score >= threshold;
}

/**
 * Search array of items with fuzzy matching
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchableText: (item: T) => string[],
  threshold: number = 0.6
): T[] {
  if (!query || query.trim().length === 0) return items;
  
  const queryLower = query.toLowerCase().trim();
  
  return items.filter(item => {
    const searchableTexts = getSearchableText(item);
    
    return searchableTexts.some(text => {
      if (!text) return false;
      
      const textLower = text.toLowerCase();
      
      // Exact substring match (highest priority)
      if (textLower.includes(queryLower)) return true;
      
      // Word-by-word matching
      const queryWords = queryLower.split(/\s+/);
      const textWords = textLower.split(/\s+/);
      
      const wordMatches = queryWords.every(queryWord => 
        textWords.some(textWord => 
          textWord.includes(queryWord) || 
          similarityScore(queryWord, textWord) >= threshold
        )
      );
      
      if (wordMatches) return true;
      
      // Full string similarity
      return similarityScore(queryLower, textLower) >= threshold;
    });
  });
}

/**
 * Get search suggestions based on partial input
 */
export function getSearchSuggestions(
  query: string,
  options: string[],
  maxSuggestions: number = 5
): string[] {
  if (!query || query.trim().length === 0) return [];
  
  const queryLower = query.toLowerCase().trim();
  
  // Score each option
  const scored = options.map(option => ({
    option,
    score: calculateSearchScore(queryLower, option.toLowerCase())
  }));
  
  // Sort by score and return top matches
  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map(item => item.option);
}

/**
 * Calculate search score for ranking
 */
function calculateSearchScore(query: string, text: string): number {
  // Exact match
  if (text === query) return 100;
  
  // Starts with query
  if (text.startsWith(query)) return 90;
  
  // Contains query
  if (text.includes(query)) return 80;
  
  // Word match
  const queryWords = query.split(/\s+/);
  const textWords = text.split(/\s+/);
  
  let wordMatchScore = 0;
  queryWords.forEach(qWord => {
    textWords.forEach(tWord => {
      if (tWord.startsWith(qWord)) wordMatchScore += 10;
      else if (tWord.includes(qWord)) wordMatchScore += 5;
    });
  });
  
  if (wordMatchScore > 0) return 70 + wordMatchScore;
  
  // Fuzzy similarity
  const similarity = similarityScore(query, text);
  if (similarity >= 0.7) return similarity * 60;
  
  return 0;
}

/**
 * Highlight matching parts of text
 */
export function highlightMatches(text: string, query: string): string {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Common car makes for suggestions
 */
export const COMMON_CAR_MAKES = [
  'Toyota',
  'Honda',
  'Mercedes-Benz',
  'BMW',
  'Audi',
  'Ford',
  'Nissan',
  'Hyundai',
  'Kia',
  'Lexus',
  'Volkswagen',
  'Mazda',
  'Subaru',
  'Jeep',
  'Land Rover',
  'Porsche',
  'Chevrolet',
  'Dodge',
  'Ram',
  'GMC',
];

/**
 * Common typos and corrections
 */
export const COMMON_TYPOS: Record<string, string> = {
  'toyot': 'toyota',
  'toyta': 'toyota',
  'toyoto': 'toyota',
  'mercedez': 'mercedes',
  'mercades': 'mercedes',
  'mersedes': 'mercedes',
  'honada': 'honda',
  'hunda': 'honda',
  'nisan': 'nissan',
  'nisssan': 'nissan',
  'hyundae': 'hyundai',
  'hundai': 'hyundai',
  'lexas': 'lexus',
  'lexes': 'lexus',
};

/**
 * Auto-correct common typos
 */
export function autoCorrect(query: string): string {
  const queryLower = query.toLowerCase().trim();
  
  // Check for exact typo matches
  if (COMMON_TYPOS[queryLower]) {
    return COMMON_TYPOS[queryLower];
  }
  
  // Check for partial typo matches
  for (const [typo, correction] of Object.entries(COMMON_TYPOS)) {
    if (queryLower.includes(typo)) {
      return queryLower.replace(typo, correction);
    }
  }
  
  return query;
}
