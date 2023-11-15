import { Injectable } from '@angular/core';
import {catchError, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {INews, INewsItem} from "../interfaces/INews";

@Injectable({
  providedIn: 'root'
})
export class NewsRestService {
  private newsKey = 'news';

  constructor(private http: HttpClient) { }

  private apiUrlNews = 'https://webapi.autodoc.ru/api/news/';
  private currentCarApiUrlItem = 'https://webapi.autodoc.ru/api/news/item/';

  public getNews(page: number, pageSize: number): Observable<INews> {
    const apiUrl = this.apiUrlNews + `/${page}/${pageSize}`;
    return this.http.get<INews>(apiUrl)
  }

  public getCurrentNews(currentCarApiUrl: string | undefined): Observable<INewsItem[]> {
    const apiUrl = this.currentCarApiUrlItem + currentCarApiUrl;
    return this.http.get<INewsItem[]>(apiUrl);
  }

  public initNewsService(): void {

  }
}
