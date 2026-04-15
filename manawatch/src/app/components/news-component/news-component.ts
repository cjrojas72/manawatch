import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { of, map, catchError, finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-news-component',
  imports: [DatePipe],
  templateUrl: './news-component.html',
  styleUrl: './news-component.css',
})
export class NewsComponent implements OnInit {

  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);

  newsFeed = signal<any[]>([]);
  isLoading = signal(false);

  fetchNews() {
    this.isLoading.set(true);
    const rssUrl = 'https://api.mtgstocks.com/news/feed';
    const proxy = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

    this.http.get<any>(proxy).pipe(
      map(res => res.items.map((i: any) => ({
        title: i.title,
        link: i.link,
        pubDate: i.pubDate,
        description: i.description.replace(/<[^>]*>/g, '').slice(0, 300) + '...'
      }))),
      catchError(() => of([])),
      finalize(() => this.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(news => this.newsFeed.set(news));
  }

  ngOnInit(): void {
    this.fetchNews();
  }
}
