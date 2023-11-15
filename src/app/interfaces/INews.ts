export interface INews {
  news: INewsItem[];
}

export interface INewsItem {
  id?: number,
  title?: string,
  description?: string,
  publishedDate?: string,
  url?: string,
  carNewsInfo?: string,
  fullUrl?: string,
  titleImageUrl?: string;
  categoryType?: string;
  text?: string;
}
