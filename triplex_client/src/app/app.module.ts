import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {MatButtonModule} from '@angular/material/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatFormFieldModule} from '@angular/material/form-field';
import { NavbarComponent } from './navbar/navbar.component';
import { MatInputModule } from '@angular/material/input';
import {MatSliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { SendJobComponent } from './send-job/send-job.component';
import {MatMenuModule} from '@angular/material/menu';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatCardModule} from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import {MatIconModule} from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PopupComponent } from './navbar/popup/popup.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CheckjobComponent } from './checkjob/checkjob.component';
import { CheckByEmailComponent } from './check-by-email/check-by-email.component';
import { GenericSearchableDropdownComponent } from './generic-searchable-dropdown/generic-searchable-dropdown.component';
import { DataVisualizationComponent } from './data-visualization/data-visualization.component';
import { InfoPopupComponent } from './generic-searchable-dropdown/info-popup/info-popup.component';
import { DataVisualizationAltComponent } from './data-visualization-alt/data-visualization-alt.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { DbdDetailsComponent } from './dbd-details/dbd-details.component';
import { SummaryWebTableComponent } from './summary-web-table/summary-web-table.component';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import { FullTpxTableComponent } from './full-tpx-table/full-tpx-table.component';
import { TriplexParamsFormComponent } from './sendjob_components/triplex-params-form/triplex-params-form.component';
import { JobInfoFormComponent } from './sendjob_components/job-info-form/job-info-form.component';
import { JobSpeciesFieldComponent } from './sendjob_components/job-species-field/job-species-field.component';
import { SendjobPromoterTestComponent } from './sendjob-promoter-test/sendjob-promoter-test.component';
import { JssRNAFieldComponent } from './sendjob_components/jss-rna-field/jss-rna-field.component';
import { GenesListComponent } from './sendjob_components/genes-list/genes-list.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SendJobComponent,
    PopupComponent,
    HomePageComponent,
    CheckjobComponent,
    CheckByEmailComponent,
    GenericSearchableDropdownComponent,
    DataVisualizationComponent,
    InfoPopupComponent,
    DataVisualizationAltComponent,
    DbdDetailsComponent,
    SummaryWebTableComponent,
    FullTpxTableComponent,
    TriplexParamsFormComponent,
    JobInfoFormComponent,
    JobSpeciesFieldComponent,
    SendjobPromoterTestComponent,
    JssRNAFieldComponent,
    GenesListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatSelectModule,
    BrowserAnimationsModule,
    MatMenuModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatSliderModule,
    MatInputModule,
    MatListModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatRadioModule,
    MatSlideToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
