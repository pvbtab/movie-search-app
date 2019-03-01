import { Component, OnInit, OnDestroy } from '@angular/core';
import { MovieSearchService } from '../services/movie-search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {

  public results: any[] = [];

  private subscriptions: Subscription[] = [];

  constructor(private ms: MovieSearchService) { }

  ngOnInit() {
    this.watchForResults();
  }

  watchForResults() {
    this.subscriptions.push(
      this.ms.listenResults().subscribe(
        results => this.results = results
      )
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach( subs => subs.unsubscribe);
  }
}
