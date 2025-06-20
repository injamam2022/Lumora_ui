export interface FacilityData {
  count: number;
  rows: FacilityRow[];
}

export interface FacilityRow {
  facilityId: number;
  locationName: string;
}
