import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {INewsItem} from "../../../interfaces/INews";

@Component({
  selector: 'autospot-add-news-modal',
  templateUrl: './add-news-modal.component.html',
  styleUrls: ['./add-news-modal.component.scss']
})
export class AddNewsModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  public newsForm!: FormGroup;
  public imageUrl!: string;
  public isUpdate!: boolean;

  ngOnInit() {
    this.newsForm = new FormGroup({
      title: new FormControl(''),
      description: new FormControl(''),
    });
  }

  public handleImageUpload(event: any): void {
    const file = event.target.files[0];
    this.imageUrl = URL.createObjectURL(file);
  }

  public publishNews(): void {
    const { title, description } = this.newsForm.value;
    const news: INewsItem = {
      title,
      description,
      titleImageUrl: this.imageUrl
    };
    let storedNews;
    const itemsFromStorage = localStorage.getItem('newsList');
    if (itemsFromStorage !== null) {
      storedNews = JSON.parse(itemsFromStorage);
    } else {
      storedNews = [];
    }
    storedNews.unshift(news);
    localStorage.setItem('newsList', JSON.stringify(storedNews));
    this.isUpdate = true;
  }

  public get loadTitle(): string {
    return this.imageUrl ? 'Заменить изображение' : 'Загрузить изображение';
  }

  public get modalTitle(): string {
    return this.isUpdate ? 'Готово' : 'Добавить новость';
  }

  public get isEnableToAddInfo(): boolean {
    const { title, description } = this.newsForm.value;
    return !!title && !!description && !!this.imageUrl;
  }

  public deleteLoadImage(): void {
    this.imageUrl = '';
  }

  public closeModal(): void {
    this.newsForm.reset();
    this.imageUrl = '';
    this.close.emit();
  }
}
