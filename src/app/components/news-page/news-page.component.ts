import {Component, EventEmitter, HostListener, Input, OnDestroy, Output} from '@angular/core';
import {INews, INewsItem} from "../../interfaces/INews";
import {catchError, forkJoin, mergeMap, Observable, of, Subscription} from "rxjs";
import {NewsRestService} from "../../services/news-rest.service";

@Component({
  selector: 'autospot-news-page',
  templateUrl: './news-page.component.html',
  styleUrls: ['./news-page.component.scss'],
})
export class NewsPageComponent implements OnDestroy {

  @Input() carArr!: INewsItem[];
  @Input() carNewsFromStorage!: INewsItem[];
  @Output() infoForCurrentCar = new EventEmitter<number>();
  private subscribtion$ = new Subscription();
  private currentPage = 1; // Текущая страница
  private loading = false; // Флаг загрузки данных
  private reachedThreshold = false; // Флаг достижения порога прокрутки

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event) {
    const threshold = 200;
    if (this.reachedThreshold || this.loading) {
      return;
    }
    // Проверка, что пользователь прокрутил достаточно близко к концу страницы
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - threshold) {
      this.reachedThreshold = true; // Устанавливаем флаг достижения порога прокрутки
      this.loadMoreImages();
    }
  }

  constructor(private newsService: NewsRestService) {
  }

  private loadMoreImages(): Subscription {
    this.loading = true;
    this.currentPage++;
    return this.subscribtion$ = this.newsService
      .getNews(this.currentPage , 6).pipe(
        mergeMap((res) => {
          this.addElemInCarsArr(res);
          const arrayOfIds = this.carArr.filter(i => !!i.url).
          map(i => this.newsService.getCurrentNews(i.url))
          return forkJoin(arrayOfIds);
        }),
        catchError(err => of(err))
      ).subscribe((infoOfCarsArr) => {
          for (let elem of infoOfCarsArr) {
            this.addInfoForCurrentCar(elem);
          }
          this.loading = false;
          this.reachedThreshold = false;
      })
  }

  private addElemInCarsArr(currentNewsArr: INews): void {
    const newImages = currentNewsArr?.news;
    for (const item of newImages) {
      this.carArr.push(item);
    }
  }

  private addInfoForCurrentCar(infoCarItem: INewsItem): void {
    const currentId = infoCarItem.id;
    const currentElem = this.carArr?.find((el) => el.id === currentId);
    currentElem!.carNewsInfo = infoCarItem.text;
  }

  public goToCurrentCarImage(item: INewsItem): void {
    if (item.id) {
      this.infoForCurrentCar.emit(item.id);
    }
  }

  ngOnDestroy(): void {
    this.subscribtion$.unsubscribe();
  }
}
