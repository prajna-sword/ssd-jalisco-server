import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";

export class CreateRoomDto {
    @IsOptional()
    @Transform(() => undefined)
    roomId: string;
    clientPageId: string;
    roomTitle: string;
    roomDescription: string;
    displayImageUrls: string[];
    roomQuantity: number;
    nightlyRate?: number | null;
    weeklyRate?: number | null;
    monthlyRate?: number | null;
    pricingMode: string;
    roomAmenities: string[];
}
