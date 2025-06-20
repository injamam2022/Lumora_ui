import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { FacilityService } from '../../facility/service/facility.service';
import { AllFacilityList } from '../../facility/interface/facility.interface';

@Component({
  selector: 'app-facility-chooser',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  template: `
    <div class="facility-container">
      <div class="form-group">
        <label>Facility</label>
        <p-dropdown 
          [options]="facilities" 
          [(ngModel)]="selectedFacility"
          optionLabel="location_name"
          placeholder="Select Facility"
          [filter]="true"
          (onChange)="onFacilityChange()"
          [appendTo]="'body'"
        ></p-dropdown>
      </div>
    </div>
  `,
  styles: [`
    .facility-container {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #475569;
        font-size: 1rem;
        font-weight: 500;
      }
    }

    :host ::ng-deep {
      .p-dropdown {
        width: 100%;
        min-width: 250px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;

        .p-dropdown-label {
          padding: 12px 16px;
          color: #64748b;
        }

        &.p-focus {
          border-color: #1d84ff;
          box-shadow: 0 0 0 2px rgba(29, 132, 255, 0.1);
        }
      }

      .p-dropdown-panel {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        margin-top: 4px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        
        .p-dropdown-filter-container {
          padding: 12px 16px;
          
          .p-dropdown-filter {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            width: 100%;
            
            &:focus {
              outline: none;
              border-color: #1d84ff;
              box-shadow: 0 0 0 2px rgba(29, 132, 255, 0.1);
            }
          }
        }
        
        .p-dropdown-items {
          padding: 8px 0;
        }
        
        .p-dropdown-item {
          padding: 10px 16px;
          color: #475569;
          
          &:hover {
            background: #f8fafc;
          }
          
          &.p-highlight {
            background: #e8f2ff;
            color: #1d84ff;
          }
        }
      }
    }
  `]
})
export class FacilityChooserComponent implements OnInit {
  @Output() facilitySelected = new EventEmitter<AllFacilityList>();

  facilities: AllFacilityList[] = [];
  selectedFacility: AllFacilityList | null = null;

  constructor(private facilityService: FacilityService) {}

  ngOnInit() {
    this.loadFacilities();
  }

  loadFacilities() {
    this.facilityService.getAllFacility().subscribe(response => {
      if (response.stat === 200) {
        this.facilities = response.all_list;
      }
    });
  }

  onFacilityChange() {
    if (this.selectedFacility) {
      this.facilitySelected.emit(this.selectedFacility);
    }
  }
} 