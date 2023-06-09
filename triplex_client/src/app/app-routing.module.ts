import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { SendJobComponent } from './send-job/send-job.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CheckjobComponent } from './checkjob/checkjob.component';
import { CheckByEmailComponent } from './check-by-email/check-by-email.component';
import { DataVisualizationComponent } from './data-visualization/data-visualization.component';
import { DataVisualizationAltComponent } from './data-visualization-alt/data-visualization-alt.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomePageComponent },
  { path: 'submit', component: SendJobComponent },
  { path: 'checkjob/token/:token', component: CheckjobComponent },
  { path: 'checkjobs/email/:email', component: CheckByEmailComponent },
  { path: 'data_visualization_alt/:token', component: DataVisualizationAltComponent },
  { path: 'data_visualization/:token', component: DataVisualizationComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
