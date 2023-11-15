import {Component, OnDestroy, OnInit} from '@angular/core';
import {NewsRestService} from "../../services/news-rest.service";
import {INews, INewsItem} from "../../interfaces/INews";
import {catchError, forkJoin, mergeMap, of, Subject, takeUntil} from "rxjs";

@Component({
  selector: 'autospot-news-list',
  templateUrl: './news-list.component.html',
  styleUrls: ['./news-list.component.scss']
})
export class NewsListComponent implements OnInit, OnDestroy {
  public news: INewsItem[] = [];
  public newsFromStorage: INewsItem[] = [];
  public openModal = false;
  private subject$ = new Subject<boolean>();
  public isEnableForShowCarInfo!: boolean;
  public currentCarInfo?: INewsItem;

  constructor(private newsService: NewsRestService) { }

  ngOnInit(): void {
    this.getInfoFromLocalStorage();
    const page = 1; // Номер страницы
    const pageSize = 6; // Количество элементов на странице
    this.newsService.getNews(page, pageSize).pipe(
      mergeMap((res) => {
        this.initialNewsArray(res);
        const arrayOfIds = this.news.filter(i => !!i.url).
        map(i => this.newsService.getCurrentNews(i.url))
        return forkJoin(arrayOfIds);
      }),
      catchError(err => of(err)),
      takeUntil(this.subject$)
    ).subscribe((infoOfCarsArr) => {
      for (let elem of infoOfCarsArr) {
        this.addInfoForCurrentCar(elem);
      }
    });
  }

  public openModalMethod(): void {
    this.openModal = true;
  }

  public handleModalClose() {
    this.openModal  = false;
  }

  private addInfoForCurrentCar(infoCarItem: INewsItem): void {
    const currentId = infoCarItem.id;
    const currentElem = this.news?.find((el) => el.id === currentId);
    currentElem!.carNewsInfo = infoCarItem.text;
  }

  private initialNewsArray(news: INews): void {
    if (news?.news?.length) {
      this.news.push(...news.news);
    } else {
      this.news = [];
    }
  }

  private getInfoFromLocalStorage(): void {
    const itemsFromStorage = localStorage.getItem('newsList');
    if (itemsFromStorage !== null) {
      this.newsFromStorage = JSON.parse(itemsFromStorage);
      this.newsFromStorage.forEach(el => {
        el.publishedDate = new Date().toLocaleDateString('en-US');
      })
    }
  }

  public showInfoForCar(currentId: number) {
    this.currentCarInfo = this.news?.find(el => el.id === currentId);
    if (this.currentCarInfo?.carNewsInfo) {
      this.currentCarInfo.carNewsInfo = this.currentCarInfo.carNewsInfo.replace(/<img.*?>/g, '');
    }
    if (this.currentCarInfo?.publishedDate) {
      this.currentCarInfo.publishedDate = new Date(this.currentCarInfo.publishedDate).toLocaleDateString('ru-RU');
    }
    this.isEnableForShowCarInfo = true;
  }

  ngOnDestroy(): void {
    this.subject$.next(true);
    this.subject$.complete();
  }

  protected readonly window = window;
}
