import { Decimal } from 'decimal.js';

/**
 * Domain primitive for handling precise monetary calculations.
 * Internal to the domain layer as permitted by the core-domain profile
 * until a shared kernel primitive is established.
 */
export class Money {
    private readonly value: Decimal;

    constructor(value: string | number | Decimal) {
        this.value = new Decimal(value);
    }

    static zero(): Money {
        return new Money(0);
    }

    plus(other: Money): Money {
        return new Money(this.value.plus(other.value));
    }

    minus(other: Money): Money {
        return new Money(this.value.minus(other.value));
    }

    times(other: string | number): Money {
        return new Money(this.value.times(other));
    }

    dividedBy(other: string | number): Money {
        return new Money(this.value.dividedBy(other));
    }

    isNegative(): boolean {
        return this.value.isNegative();
    }

    equals(other: Money): boolean {
        return this.value.equals(other.value);
    }

    toFixed(decimalPlaces = 2): string {
        return this.value.toFixed(decimalPlaces);
    }

    toNumber(): number {
        return this.value.toNumber();
    }
}
