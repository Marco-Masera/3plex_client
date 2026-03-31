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
      // Only track when navigation has fully completed
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Send the page view to Google Analytics
      gtag('config', trackingId, {
        page_path: event.urlAfterRedirects
      });
      
    });
  }
}
