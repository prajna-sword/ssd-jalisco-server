import { differenceInCalendarDays } from "date-fns";
import { Room } from "src/lodging/rooms/entities/room.entity";
import { GuestCount, RoomSelection } from "src/payments/dto/create-payment.dto";

export interface RateCalcObj {
    checkInDate: Date;
    checkOutDate: Date;
    nightlyRate: number | null | undefined;
    weeklyRate: number | null | undefined;
    monthlyRate: number | null | undefined;
    pricingStrategy: string;
    roomQuantity: number;
    guestCount: GuestCount;
}

export enum PricingModes {
    HYBRID = 'hybrid',
    PRORATED = 'prorated'
}

export function calculateApplicationFeeCentavos(
    amountInCentavos: number,
    feePercent: number,
): number {
    if (amountInCentavos <= 0 || feePercent <= 0) {
        return 0;
    }

    // Multiply by basis points (feePercent * 100) first, then divide by 10,000
    // to avoid floating-point drift (e.g. 0.1 * 3 = 0.30000000000000004)
    const basisPoints = Math.round(feePercent * 100);
    return Math.round((amountInCentavos * basisPoints) / 10_000);
}

export function calculateBookingTotalV2(selections: RoomSelection[], rooms: Room[]) {
    const calcObjs: RateCalcObj[] = [];
    for (let selection of selections) {
        const matchingRoom = rooms.find(room => room.roomId === selection.roomId);
        if (matchingRoom) {
            calcObjs.push({
                checkInDate: selection.checkInDate,
                checkOutDate: selection.checkOutDate,
                nightlyRate: matchingRoom.nightlyRate,
                weeklyRate: matchingRoom.weeklyRate,
                monthlyRate: matchingRoom.monthlyRate,
                pricingStrategy: matchingRoom.pricingMode,
                roomQuantity: selection.quantity,
                guestCount: selection.guestCount
            });
        }
    }
    let total = 0;
    for (let calc of calcObjs) {
        total += calcObjRoomTotal(calc);
    }
    return Math.round((total + Number.EPSILON) * 100) / 100;
}

function calcObjRoomTotal(
    calcObj: RateCalcObj
) {
    return calculateRoomTotalV2(
        calcObj.checkInDate,
        calcObj.checkOutDate,
        calcObj.roomQuantity,
        calcObj.nightlyRate,
        calcObj.weeklyRate,
        calcObj.monthlyRate,
        calcObj.pricingStrategy
    )
}

function calculateRoomTotalV2(
    checkInDate: Date,
    checkOutDate: Date,
    roomQuantity: number,
    nightlyRate: number | null | undefined,
    weeklyRate: number | null | undefined,
    monthlyRate: number | null | undefined,
    pricingMode: string
) {
    let total = 0;
    for (let i = 0; i < roomQuantity; i++) {
        if (checkInDate && checkOutDate) {
            let diff = differenceInCalendarDays(checkOutDate, checkInDate);
            // Less than a week || only nightly rate available || only nightly and monthly but less
            // than 28 days
            if (diff < 7 || (!weeklyRate && !monthlyRate) ||
                (diff < 28 && !weeklyRate)) {
                // calculate with only nightly rate
                total += (nightlyRate as any * diff);
            }
            // More than a week && (less than a month or no monthly rate)
            else if (diff >= 7 && (diff < 28 || !monthlyRate)) {
                const weeks = Math.trunc(diff / 7);
                const remainder = diff % 7;
                total += (weeklyRate as any * weeks)
                let remainderRate = nightlyRate as any;
                if (pricingMode === PricingModes.PRORATED) {
                    remainderRate = Math.round((weeklyRate as any / 7 + Number.EPSILON) * 100) / 100;
                }
                total += (remainder * remainderRate);
            }
            // A month or more
            else if (diff >= 28 && monthlyRate) {
                const months = Math.trunc(diff / 28);
                const remainder = diff % 28;
                total += (monthlyRate as any * months);
                if (pricingMode === PricingModes.PRORATED) {
                    let remainderRate = Math.round((monthlyRate as any / 28 + Number.EPSILON) * 100) / 100;
                    total += (remainder * remainderRate);
                }
                else if (pricingMode === PricingModes.HYBRID) {
                    if (remainder < 7 || !weeklyRate) {
                        total += (nightlyRate as any * remainder);
                    } else {
                        const weeks = Math.trunc(remainder / 7);
                        const remainingRemainder = remainder % 7;
                        total += (weeklyRate as any * weeks)
                        if (remainingRemainder > 0) {
                            total += (nightlyRate as any * remainingRemainder);
                        }
                    }
                } else {
                    console.log('We hit the else when we should not have');
                }
            }
            else {
                console.log('We hit the else when we should not have');
            }
        }
    }
    return Math.round((total + Number.EPSILON) * 100) / 100;
}