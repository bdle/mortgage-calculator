import { useMemo } from 'react';
import { parseUSNumber } from '../utils/formatters';

export function useMortgageCalculator({
    purchasePrice,
    downPaymentType,
    downPaymentPercent,
    downPaymentAmount,
    interestRate,
    loanTermYears,
    yearlyPropertyTax,
    yearlyInsurance,
    hoaFee,
    yearlyWaterCost,
    propertyManagementFee,
    monthlyRent,
}) {
    return useMemo(() => {
        const price = purchasePrice === '' ? 0 : Number(parseUSNumber(purchasePrice));
        const pct = downPaymentPercent === '' ? 0 : Number(parseUSNumber(downPaymentPercent));
        const dpAmt = downPaymentAmount === '' ? 0 : Number(parseUSNumber(downPaymentAmount));
        const rate = interestRate === '' ? 0 : Number(parseUSNumber(interestRate));
        const term = Number(loanTermYears) || 0;

        const tax = yearlyPropertyTax === '' ? 0 : Number(parseUSNumber(yearlyPropertyTax));
        const ins = yearlyInsurance === '' ? 0 : Number(parseUSNumber(yearlyInsurance));
        const hoa = hoaFee === '' ? 0 : Number(parseUSNumber(hoaFee));

        // Convert Yearly Water Cost into Monthly Expense 
        const yearlyWater = yearlyWaterCost === '' ? 0 : Number(parseUSNumber(yearlyWaterCost));
        const monthlyWater = yearlyWater / 12;

        const pm = propertyManagementFee === '' ? 0 : Number(parseUSNumber(propertyManagementFee));
        const rent = monthlyRent === '' ? 0 : Number(parseUSNumber(monthlyRent));

        // Down payment & loan amount calculation [cite: 1, 2]
        const actualDownPayment = downPaymentType === 'percent' ? (price * pct) / 100 : dpAmt;
        const loanAmount = Math.max(0, price - actualDownPayment);
        const monthlyInterestRate = rate / 100 / 12;
        const totalPayments = term * 12;

        // Principal & Interest Formula [cite: 2]
        let monthlyPrincipalAndInterest = 0;
        if (monthlyInterestRate > 0 && totalPayments > 0) {
            monthlyPrincipalAndInterest =
                (loanAmount *
                    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, totalPayments))) /
                (Math.pow(1 + monthlyInterestRate, totalPayments) - 1);
        } else if (totalPayments > 0) {
            monthlyPrincipalAndInterest = loanAmount / totalPayments;
        }

        const monthlyTax = tax / 12;
        const monthlyInsurance = ins / 12;

        const totalMonthlyPayment =
            monthlyPrincipalAndInterest + monthlyTax + monthlyInsurance + hoa + monthlyWater + pm;

        // Rent Roll vs Mortgage calculation 
        const netCashFlow = rent - totalMonthlyPayment;
        const isRentCovered = netCashFlow >= 0;

        return {
            loanAmount,
            monthlyPrincipalAndInterest,
            monthlyTax,
            monthlyInsurance,
            monthlyWater,
            totalMonthlyPayment,
            rent,
            netCashFlow,
            isRentCovered,
        };
    }, [
        purchasePrice,
        downPaymentType,
        downPaymentPercent,
        downPaymentAmount,
        interestRate,
        loanTermYears,
        yearlyPropertyTax,
        yearlyInsurance,
        hoaFee,
        yearlyWaterCost,
        propertyManagementFee,
        monthlyRent,
    ]);
}