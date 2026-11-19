// weather.service.ts
import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { LocationWeather, RegionalWeatherResponse } from './dto/weather.dto';

@Injectable()
export class WeatherService {
    private readonly apiKey?: string;
    private readonly baseUrl =
        'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline';

    private cache: { data: RegionalWeatherResponse; expiresAt: number } | null = null;
    private readonly cacheTtlMs = 15 * 60 * 1000;

    private readonly coordinates = {
        ssdo: { name: 'San Sebastián del Oeste', q: '20.7606,-104.8531' },
        pvr: { name: 'Puerto Vallarta', q: '20.6534,-105.2253' },
    };

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        // Optional: works without a key under fair-use, or uses your free registered key
        this.apiKey = this.configService.get<string>('VISUAL_CROSSING_API_KEY')?.trim();
    }

    async getRegionalWeather(): Promise<RegionalWeatherResponse> {
        if (this.cache && Date.now() < this.cache.expiresAt) {
            return this.cache.data;
        }

        try {
            const [ssdo, pvr] = await Promise.all([
                this.fetchLocation('ssdo', this.coordinates.ssdo.name, this.coordinates.ssdo.q),
                this.fetchLocation('pvr', this.coordinates.pvr.name, this.coordinates.pvr.q),
            ]);

            const response: RegionalWeatherResponse = {
                locations: { ssdo, pvr },
                cachedAt: new Date().toISOString(),
            };

            this.cache = {
                data: response,
                expiresAt: Date.now() + this.cacheTtlMs,
            };

            return response;
        } catch (error) {
            if (this.cache) {
                return this.cache.data;
            }
            throw new HttpException('Unable to fetch weather data', HttpStatus.BAD_GATEWAY);
        }
    }

    private async fetchLocation(
        id: 'ssdo' | 'pvr',
        name: string,
        coords: string,
    ): Promise<LocationWeather> {
        const params: Record<string, string> = {
            unitGroup: 'metric',
            include: 'current,hours', // 'hours' pulls the gridded model hour
            maxDistance: '5000',
            elevationDifference: '300',
            contentType: 'json',
        };

        if (this.apiKey) {
            params.key = this.apiKey;
        }

        const { data } = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/${encodeURIComponent(coords)}`, {
                params,
                headers: {
                    Accept: 'application/json',
                    'User-Agent': 'JaliscoWeatherService/1.0',
                },
            }),
        );

        const current = data.currentConditions;

        return {
            id,
            name,
            tempC: current.temp,
            feelsLikeC: current.feelslike,
            humidity: current.humidity,
            cloudCover: current.cloudcover,
            windKph: current.windspeed,
            conditionText: current.conditions,
            conditionIcon: current.icon, // Returns icon slug like "fog", "partly-cloudy-day", "clear-day"
            visibilityKm: current.visibility,
            fogRisk: this.calculateFogRisk(current),
            updatedAt: current.datetime,
        };
    }

    private calculateFogRisk(current: any): 'none' | 'low' | 'moderate' | 'high' {
        const dewPointSpread = current.temp - current.dew;
        const conditionsLower = (current.conditions ?? '').toLowerCase();
        const isFogReported =
            current.icon === 'fog' ||
            conditionsLower.includes('fog') ||
            conditionsLower.includes('mist');

        if (isFogReported || current.visibility <= 1) {
            return 'high';
        }
        if (current.visibility <= 4 || (dewPointSpread <= 2 && current.cloudcover >= 75)) {
            return 'moderate';
        }
        if (dewPointSpread <= 3.5 && current.humidity >= 85 && current.windspeed <= 12) {
            return 'low';
        }
        return 'none';
    }
}
