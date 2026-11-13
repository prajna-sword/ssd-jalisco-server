export class CreateClientPageDto {
  clientPageId: string;
  clientId: string;
  businessType: string;
  businessNameRouteSegment: string;
  displayPage: boolean;
  businessName: string | null;
  shortDescription: string | null;
  searchDisplayImageUrl: string | null;
  searchDisplayAddress: string | null;
  searchDisplayPlaceId: string | null;
  searchDisplayCoords: string | null;
  detailPageHeroImageUrl: string | null;
  detailPageAdditionalImageUrls: string[] | null;
  detailPageBusinessDescription: string | null;
  amenitiesList: string[] | null;
  rulesList: string[] | null;
  customRulesList: string[] | null;
  checkInWindow: string | null;
  checkOutWindow: string | null;
  safetyFeatures: string[] | null;
  safetyNotes: string | null;
  bookingCancellationPolicy: string | null;
  allowDeferredPayments: boolean | null;
  allowMultiBookings: boolean | null;
  createdTimestamp: Date;
  updatedTimestamp: Date;
}

export enum BusinessType {
  Hotel = 'H',
  Restaurant = 'R',
  Experience = 'E',
  Shop = 'S',
  Listing = 'L'
}
