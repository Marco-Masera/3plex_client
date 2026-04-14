import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { trackingId } from 'src/environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'triplex_client';

  constructor(private router: Router) {}

  ngOnInit() {
    this.setupGoogleAnalytics();
  }

  private setupGoogleAnalytics() {
    // Listen to router events
    this.router.events.pipe(
      // The crucial fix: adding "(event): event is NavigationEnd =>"
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      
      // Now TypeScript knows for a fact 'event' is a NavigationEnd
      // and has the 'urlAfterRedirects' property.
      gtag('config', trackingId, {
        page_path: event.urlAfterRedirects
      });
      
    });
  }
}
