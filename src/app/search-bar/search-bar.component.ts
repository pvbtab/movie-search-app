import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RoutesRecognized } from '@angular/router';
import { MovieSearchService } from '../services/movie-search.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit, OnDestroy {

  public searchScopes = ['movie title', 'movie persons'];
  public selectedScope = this.searchScopes[0];
  public query = '';

  private subscriptions: Subscription[] = [];

  constructor(private ms: MovieSearchService, private router: Router) { }

  ngOnInit() {
    this.restoreInputs();
  }

  restoreInputs() {
    // restore parameters if page was opened by link
    this.subscriptions.push(
      this.router.events.subscribe(event => {
        if (event instanceof RoutesRecognized) {
          if (!event.state.root.firstChild) {
            return;
          }

          const params = event.state.root.firstChild.params;

          this.selectedScope = decodeURIComponent(params.scope) || this.searchScopes[0];
          this.query = decodeURIComponent(params.query) || '';
          this.setSearchScope(this.selectedScope);

          // if query string present do the search now
          if (this.query) {
            this.searchNow(true);
          }
        }
      })
    );
  }

  setSearchScope(scope: string) {
    this.selectedScope = scope;
  }

  searchNow(fromRoute = false) {
    if (!fromRoute) {
      this.router.navigate([`/search/${encodeURIComponent(this.selectedScope)}/${encodeURIComponent(this.query)}`]);
    }
    this.ms.search(this.query, this.selectedScope);
  }

  onKey(event) {
    if (event.key === 'Enter' && this.query) {
      this.searchNow();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach( subs => subs.unsubscribe);
  }

}
