
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SendJobComponent } from './send-job/send-job.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CheckjobComponent } from './checkjob/checkjob.component';
import { CheckByEmailComponent } from './check-by-email/check-by-email.component';
import { DataVisualizationComponent } from './data-visualization/data-visualization.component';
import { DataVisualizationAltComponent } from './data-visualization-alt/data-visualization-alt.component';
import { SendjobPromoterTestComponent } from './sendjob-promoter-test/sendjob-promoter-test.component';
import { HelpPageComponent } from './help-page/help-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'help', component: HelpPageComponent },
  { path: 'submit', component: SendJobComponent },
  { path: 'submit_promoter_stability_test', component: SendjobPromoterTestComponent },
  { path: 'checkjob/token/:token', component: CheckjobComponent },
  { path: 'checkjobs/email/:email', component: CheckByEmailComponent },
  { path: 'data_visualization_alt/:token', component: DataVisualizationAltComponent },
  { path: 'data_visualization/:token', component: DataVisualizationComponent },
  { path: 'data_visualization/:token/:dsDNAID', component: DataVisualizationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
