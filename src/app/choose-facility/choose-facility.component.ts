import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FacilityChooserComponent } from '../stage-creation/facility-chooser/facility-chooser.component';
import { AllFacilityList } from '../facility/interface/facility.interface';

@Component({
  selector: 'app-choose-facility',
  standalone: true,
  imports: [CommonModule, FacilityChooserComponent],
  template: `
    <div class="choose-facility-page">
      <div class="page-content">
        <div class="chooser-container">
          <app-facility-chooser
            (facilitySelected)="onFacilitySelected($event)"
          ></app-facility-chooser>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .choose-facility-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
    }

    .page-content {
      width: 100%;
      max-width: 1000px;
      padding: 2rem;
    }

    .chooser-container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
  `]
})
export class ChooseFacilityComponent {
  selectedFacility: AllFacilityList | null = null;

  constructor(private router: Router) {}

  onFacilitySelected(facility: AllFacilityList) {
    this.selectedFacility = facility;
    if (this.selectedFacility) {
      this.router.navigate(['/stage-creation'], {
        queryParams: { facilityId: this.selectedFacility.facility_id }
      });
    }
  }
}
