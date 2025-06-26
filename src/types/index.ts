export type DataPart = { type: "append-message"; message: string };
export interface UploadedFile {
  name: string;
  size: number;
  key: string;
  type: string;
}

export type StoredFile = {
  id: string;
  name: string;
  url: string;
  type: string;
};

export type SearchResults = {
  images: SearchResultImage[];
  results: SearchResultItem[];
  number_of_results?: number;
  query: string;
};

// If enabled the include_images_description is true, the images will be an array of { url: string, description: string }
// Otherwise, the images will be an array of strings
export type SearchResultImage =
  | string
  | {
      url: string;
      description: string;
      number_of_results?: number;
    };

export type ExaSearchResults = {
  results: ExaSearchResultItem[];
};

export type SearchResultItem = {
  title: string;
  url: string;
  content: string;
};

export type ExaSearchResultItem = {
  score: number;
  title: string;
  id: string;
  url: string;
  publishedDate: Date;
  author: string;
};

export type SerperSearchResultItem = {
  title: string;
  link: string;
  snippet: string;
  imageUrl: string;
  duration: string;
  source: string;
  channel: string;
  date: string;
  position: number;
};
