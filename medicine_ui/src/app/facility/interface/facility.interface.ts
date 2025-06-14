export interface CountryList {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllListCountry[];
}

export interface AllListCountry {
  country_id: string;
  sortname: string;
  country_name: string;
  currency?: string;
  currency_code?: string;
  price_multiplier: string;
  stock_exchange: string;
  created_at: string;
  del_status: string;
}

export interface StateList {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllListState[];
}

export interface AllListState {
  state_id: string;
  state_name: string;
  country_id: string;
  del_status: string;
}

export interface CityList {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllCityList[];
}

export interface AllCityList {
  city_id: string;
  city_name: string;
  state_id: string;
  del_status: string;
}

export interface Facility {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllFacilityList[];
}

export interface AllFacilityList {
  facility_id: string;
  country_id: string;
  state_id: string;
  city_id: string;
  location_name: string;
  location_phone: string;
  location_postcode: string;
  added_date: string;
  del_status: string;
  location_full_address: string;
}

export interface DeleteFacility {
  stat: string | number;
  msg: string;
}

export interface CreateFacilityPayload {
  state_id: number | string;
  country_id: number | string;
  city_id: number | string;
  location_name: string;
  location_phone: string;
  location_postcode: string;
  location_full_address: string;
}

export interface SingleFacility {
  stat: number;
  msg: string;
  list_count: number;
  all_list: FacilityData[];
}

export interface FacilityData {
  facility_id: string;
  country_id: string;
  state_id: string;
  city_id: string;
  location_name: string;
  location_phone: string;
  location_postcode: string;
  added_date: string;
  del_status: string;
  location_full_address: string;
}
