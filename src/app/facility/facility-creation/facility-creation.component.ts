import { Component } from '@angular/core';
import {
  CityList,
  CountryList,
  CreateFacilityPayload,
  Facility,
  StateList,
} from '../interface/facility.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ToasterService } from '../../shared/services/toaster.service';
import { FacilityService } from '../service/facility.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-facility-creation',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, DropdownModule],
  templateUrl: './facility-creation.component.html',
  styleUrl: './facility-creation.component.scss',
})
export class FacilityCreationComponent {
  public createFacilityPayload: CreateFacilityPayload = {
    state_id: 1,
    country_id: '101',
    city_id: 1,
    location_name: '',
    location_phone: '',
    location_postcode: '',
    location_full_address: '',
  };
  public allFacilityData!: Facility;

  public allCountryList!: CountryList;
  public allStateList!: StateList;
  public allCityList!: CityList;

  public constructor(
    private readonly config: DynamicDialogConfig,
    public facilityService: FacilityService,
    public toasterService: ToasterService,
    private readonly ref: DynamicDialogRef
  ) {}

  ngOnInit() {
    this.facilityService.getAllCountry().subscribe((responseAllCountry) => {
      //console.log(responseAllCountry);
      this.allCountryList = responseAllCountry;
    });

    if (this.config.data.purpose === 'edit') {
      this.facilityService
        .getSingleFacility(this.config.data.id)
        .subscribe((responseData) => {
          console.log(responseData);
          const facility = responseData.all_list[0];

          this.createFacilityPayload = {
            ...this.createFacilityPayload,
            ...facility,
          };
        });
    }

    this.getTheStates(this.createFacilityPayload.country_id);
  }

  getTheStates(countryId: any) {
    console.log(countryId);
    this.facilityService
      .getAllState(countryId)
      .subscribe((responseAllState) => {
        //console.log(responseAllCountry);
        this.allStateList = responseAllState;
      });
  }

  getTheCities(stateId: any) {
    this.facilityService
      .getAllCities(stateId)
      .subscribe((responseAllCities) => {
        console.log(responseAllCities);
        this.allCityList = responseAllCities;
      });
  }

  public addCreation() {
    console.log(this.config.data.purpose);
    if (this.config.data.purpose === 'edit') {
      this.facilityService
        .updateFacility(this.createFacilityPayload, this.config.data.id)
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Facility Updated');
          //refresh Table Role Data
          this.facilityService.refreshTableData(true);
        });
      this.ref.close();
    } else if (this.config.data.purpose === 'add') {
      this.facilityService
        .addFacility(this.createFacilityPayload)
        .subscribe((response) => {
          console.log(response);
          this.toasterService.successToast('Facility Added');
          //refresh Table Role Data
          this.facilityService.refreshTableData(true);
        });
      this.ref.close();
    }
  }
}
