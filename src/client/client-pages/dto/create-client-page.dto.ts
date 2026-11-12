export class CreateClientPageDto {
      clientPageId: string;
      clientId: string;
      businessType: BusinessType;
      cardTitle: string;
      cardSubtitle: string;
      cardDescription: string;
      cardImageUrl: string;
      cardImageAltText: string;
      businessNameRouteSegment: string;
      detailPageHeroTitle?: string;
      detailPageHeroSubtitle?: string;
      detailPageHeroImageUrl?: string;
      detailPageBusinessDescription?: string;
      hotelEstimatedRateLow?: string;
      hotelEstimatedRateHigh?: string;
      hotelAmenitiesList?: string[];
      allowBookingCancellations: boolean;
      cancellationFlatRate: string;
      cancellationPercentRate: number;
      createdTimestamp: string;
      updatedTimestamp: string;
}

export enum BusinessType {
  Hotel = 'H',
  Restaurant = 'R',
  Experience = 'E',
  Shop = 'S',
  Listing = 'L'
}
