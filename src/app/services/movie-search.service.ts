import { environment } from '../../environments/environment';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';
import { Subject, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieSearchService {

  private searchResults: Subject<any> = new Subject();

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  extractYear(query: string) {
    const year = query.match(/\d{4}/i);
    return year.length === 0 ? false : year[0];
  }

  buildApiQuery(query: string, year = '') {
    // remove duble spaces inside the query
    query.replace(/\s{2,}/g, ' ');

    const params = [
      'apikey=' + environment.omdbApiKey,
      's=' + query.trim(),
      'type=movie',
      'plot=full'
    ];
    if (year) {
      params.push(`y=${year}`);
    }
    return environment.omdbEndPoint + '?' + params.join('&');
  }

  search(query: string, scope: string) {
    if (scope !== 'movie title') {
      this.snackBar.open('Search by person not available on OMDb API', 'Ok');
      this.searchResults.next([]);
      return;
    }

    this.http.get(this.buildApiQuery(query)).pipe(
      switchMap((response: any) => {
        // if nothing was found but year present, do second request with year
        if (response.Response === 'False') {
          const year = this.extractYear(query);
          if (year) {
            return this.http.get(this.buildApiQuery(query.replace(year, ''), year));
          }
        }
        return  of(response);
      })
    ).subscribe(
      (result: any) => {
        if (result.Response === 'True') {
          this.searchResults.next(result.Search);
        } else {
          this.searchResults.next([]);
        }
      },
      (error) => {
        // response with empty results if error
        this.searchResults.next([]);
      }
    );
  }

  listenResults() {
    return this.searchResults.asObservable();
  }
}
