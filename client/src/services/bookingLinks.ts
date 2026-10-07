export interface IRCTCJourneyParams {
  trainNumber?: string;
  trainName?: string;
  fromStationName?: string;
  fromStationCode?: string;
  toStationName?: string;
  toStationCode?: string;
  journeyDate?: string;
  selectedClass?: string;
}

export interface FlightBookingParams {
  originCity: string;
  originAirportCode?: string;
  destinationCity: string;
  destinationAirportCode?: string;
  journeyDate?: string;
  airline?: string;
  flightNumber?: string;
}

export interface RideBookingParams {
  pickupLat?: number;
  pickupLng?: number;
  pickupAddress: string;
  dropLat?: number;
  dropLng?: number;
  dropAddress: string;
}

export const bookingLinks = {
  /**
   * Generates the official IRCTC URL and formatted journey text for clipboard copying.
   * Note: Official IRCTC (irctc.co.in) does not support public unauthenticated URL query prefilling for stations.
   * YATRA360 preserves journey details and provides a 1-click clipboard summary so the user can easily paste on IRCTC.
   */
  getIRCTCBookingInfo(params: IRCTCJourneyParams): {
    url: string;
    summary: string;
    note: string;
  } {
    const from = params.fromStationCode
      ? `${params.fromStationName || ''} (${params.fromStationCode})`
      : params.fromStationName || 'Origin Station';
    const to = params.toStationCode
      ? `${params.toStationName || ''} (${params.toStationCode})`
      : params.toStationName || 'Destination Station';
    const train = params.trainNumber
      ? `${params.trainName || ''} (#${params.trainNumber})`
      : 'Indian Railways';
    const date = params.journeyDate || 'Travel Date';
    const cls = params.selectedClass || 'Any Class';

    const summary = `Journey Details:\n• Train: ${train}\n• From: ${from}\n• To: ${to}\n• Date: ${date}\n• Class: ${cls}`;

    return {
      url: 'https://www.irctc.co.in/nget/train-search',
      summary,
      note: 'IRCTC requires manual entry for stations due to portal security policy. Details have been copied to your clipboard.'
    };
  },

  /**
   * Generates flight search redirect URL with origin, destination, and travel date
   */
  getFlightBookingUrl(params: FlightBookingParams): string {
    const origin = params.originAirportCode || params.originCity;
    const dest = params.destinationAirportCode || params.destinationCity;
    const date = params.journeyDate || '';

    // Standard Google Flights deep link with prefilled route and date
    return `https://www.google.com/travel/flights?q=flights+from+${encodeURIComponent(
      origin
    )}+to+${encodeURIComponent(dest)}${date ? `+on+${encodeURIComponent(date)}` : ''}`;
  },

  /**
   * Official Uber Universal Web Booking URL with supported route parameters
   */
  getUberBookingUrl(params: RideBookingParams): string {
    const base = 'https://m.uber.com/ul/?action=setPickup';
    const query = new URLSearchParams();

    if (params.pickupLat && params.pickupLng) {
      query.append('pickup[latitude]', params.pickupLat.toFixed(6));
      query.append('pickup[longitude]', params.pickupLng.toFixed(6));
    }
    query.append('pickup[nickname]', params.pickupAddress || 'Current Pickup');

    if (params.dropLat && params.dropLng) {
      query.append('dropoff[latitude]', params.dropLat.toFixed(6));
      query.append('dropoff[longitude]', params.dropLng.toFixed(6));
    }
    query.append('dropoff[nickname]', params.dropAddress || 'Destination Hub');

    return `${base}&${query.toString()}`;
  },

  /**
   * Official Ola Cabs Web Booking URL with supported route parameters
   */
  getOlaBookingUrl(params: RideBookingParams): string {
    const query = new URLSearchParams();

    if (params.pickupLat && params.pickupLng) {
      query.append('pickup_lat', params.pickupLat.toFixed(6));
      query.append('pickup_lng', params.pickupLng.toFixed(6));
    }
    query.append('pickup_name', params.pickupAddress || 'Pickup');

    if (params.dropLat && params.dropLng) {
      query.append('drop_lat', params.dropLat.toFixed(6));
      query.append('drop_lng', params.dropLng.toFixed(6));
    }
    query.append('drop_name', params.dropAddress || 'Destination');

    return `https://book.olacabs.com/?${query.toString()}`;
  },

  /**
   * Official Rapido Booking URL.
   * Rapido does not currently provide a public unauthenticated web route-prefill API;
   * we navigate safely to the official portal.
   */
  getRapidoBookingUrl(): string {
    return 'https://rapido.bike';
  }
};

export function openUber(params: RideBookingParams): void {
  const url = bookingLinks.getUberBookingUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openOla(params: RideBookingParams): void {
  const url = bookingLinks.getOlaBookingUrl(params);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openRapido(_params?: { pickupAddress?: string; dropAddress?: string }): void {
  const url = bookingLinks.getRapidoBookingUrl();
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openIRCTC(params: {
  source?: string;
  destination?: string;
  journeyDate?: string;
  trainNumber?: string;
  trainName?: string;
  classCode?: string;
}): void {
  const info = bookingLinks.getIRCTCBookingInfo({
    fromStationName: params.source,
    toStationName: params.destination,
    journeyDate: params.journeyDate,
    trainNumber: params.trainNumber,
    trainName: params.trainName,
    selectedClass: params.classCode
  });
  navigator.clipboard.writeText(info.summary).catch(() => {});
  window.open(info.url, '_blank', 'noopener,noreferrer');
}

export function copyJourneyDetailsToClipboard(params: {
  source?: string;
  destination?: string;
  journeyDate?: string;
  trainNumber?: string;
  trainName?: string;
  classCode?: string;
}): void {
  const info = bookingLinks.getIRCTCBookingInfo({
    fromStationName: params.source,
    toStationName: params.destination,
    journeyDate: params.journeyDate,
    trainNumber: params.trainNumber,
    trainName: params.trainName,
    selectedClass: params.classCode
  });
  navigator.clipboard.writeText(info.summary).catch(() => {});
}

export function openFlightBooking(params: {
  origin: string;
  destination: string;
  departureDate?: string;
}): void {
  const url = bookingLinks.getFlightBookingUrl({
    originCity: params.origin,
    destinationCity: params.destination,
    journeyDate: params.departureDate
  });
  window.open(url, '_blank', 'noopener,noreferrer');
}
