import { Component, OnInit, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, map, catchError } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-news-component',
  imports: [DatePipe],
  templateUrl: './news-component.html',
  styleUrl: './news-component.css',
})
export class NewsComponent implements OnInit{

  newsFeed = signal<any[]>([]);
  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  fetchNews() {
    this.isLoading.set(true)
    const rssUrl = 'https://api.mtgstocks.com/news/feed';
    const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    this.http.get<any>(proxy).pipe(
      map(res => {
        return res.items.map((i: any) => ({
          title: i.title,
          link: i.link,
          pubDate: i.pubDate,
          description: i.description.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
        }));
      }),
      catchError(() => of([]))
    ).subscribe(news => this.newsFeed.set(news));

    this.isLoading.set(false);
  }

  ngOnInit(): void {
    this.fetchNews();
  }
}
