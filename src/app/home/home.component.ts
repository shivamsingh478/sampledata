import { SubCategory } from './../app.interface';
import { Component, OnInit, inject, Pipe, Inject } from '@angular/core';
import { AppService } from '../app.service';
import { SharedModule } from '../shared.module';
import { Category } from '../app.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SkeletonComponent } from '../skeleton/skeleton.component';
import { DOCUMENT } from '@angular/common';
import { AboutComponent } from '../about/about.component';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SharedModule, NgxSkeletonLoaderModule, SkeletonComponent, AboutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  appService: AppService = inject(AppService)

  public categories: Category[] = [];
  totalWords: number | undefined;
  generatedText: string = '';
  showTextArea: boolean = false;
  selectedCategory: Category | undefined = undefined;
  slug: any;
  selected_category: string = '';
  selected_Subcatgory: string = '';
  skeleton: boolean = true;

  constructor(private router: Router, private meta: Meta, private title: Title, private activatedRoute: ActivatedRoute, @Inject(DOCUMENT) private doc: any) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.slug = params['slug'];
      if (this.slug) {
        this.selectCategoryBySlug(this.slug);
      }
    });
    this.getCategory();
  }

  getCategory() {
    this.skeleton = true;
    this.appService.fetchData().subscribe(data => {
      this.categories = data;
      if (this.categories.length > 0) {
        this.selectCategory(this.categories[1])
      }
      this.selectCategoryBySlug(this.slug);
      this.skeleton = false;
    });
  }

  setTitle(Meta_title: string) {
    this.title.setTitle(Meta_title);
  }
  setDescription(description: string) {
    this.meta.updateTag({ name: 'description', content: description });
  }

  selectCategoryBySlug(slug: string) {
    if (this.categories.length === 0) {
      return;
    }
    const foundCategory = this.categories.find(category => category.slug === slug);
    if (foundCategory) {
      this.selectCategory(foundCategory);
    }
    for (const category of this.categories) {
      const foundSubCategory = category.sub_category.find(subcategory => subcategory.slug === slug);
      if (foundSubCategory) {
        this.selectCategory(category, foundSubCategory.id);
        return;
      }
    }
  }

  selectCategory(category: Category, subcategory_id: number | null = null) {
    this.selected_category = category.category_name;
    const categoryCopy = JSON.parse(JSON.stringify(category));
    this.selectedCategory = category;
    let CategorySlug = category.url;
    if (subcategory_id) {
      const foundSubcategory = category.sub_category.find(subcategory => subcategory.id === subcategory_id);
      if (foundSubcategory) {
        CategorySlug = `${foundSubcategory.url}`;
      }
    }
    this.router.navigate([CategorySlug]);
    if (subcategory_id) {
      categoryCopy.sub_category = categoryCopy.sub_category.filter((data: any) => data.id === subcategory_id);
    }
    this.selectedCategory = categoryCopy;
    this.setCanonicalURL();
    this.setTitle(category.meta_title);
    this.setDescription(category.description);
  }

  generateText() {
    if (this.totalWords) {
      this.appService.generatesampelText(this.totalWords).subscribe(
        (text: string) => {
          this.generatedText = text;
          this.showTextArea = true;
        },
        (error: any) => {
          console.error('Error generating text:', error);
        }
      );
    } else {
      this.showTextArea = false;
      this.generatedText = '';
    }
  }

  downloadData(url: string, resolution: string) {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `sampleData_${resolution}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch(error => console.error('Error downloading image:', error));
  }

  copyText() {
    const textarea = document.createElement('textarea');
    textarea.value = this.generatedText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  setCanonicalURL() {
    const existingCanonicalLink = this.doc.querySelector('link[rel="canonical"]');
    if (existingCanonicalLink) {
      existingCanonicalLink.remove();
    }
    let link = this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.doc.head.appendChild(link);
    link.setAttribute('href', window.location.href);
    window.addEventListener('popstate', () => {
      link.setAttribute('href', window.location.href);
    });
  }
}


