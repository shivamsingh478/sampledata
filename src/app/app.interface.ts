import { Title } from '@angular/platform-browser';
export interface Category {
  category_id: number;
  category_name: string;
  display_order: number;
  description: string;
  icon: string;
  url: string;
  slug: string;
  meta_title: string;
  title: string;
  meta_keywords: string;
  meta_description: string;
  sub_category: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  disp_order: number;
  icon: string;
  url: string;
  slug: string;
  file: File[];
  meta_description: string;
  meta_title: string;
}

export interface File {
  id: number;
  resolution: string;
  size: number;
  url: string;
}
