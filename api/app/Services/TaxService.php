<?php

namespace App\Services;

class TaxService
{
    public const TPS_RATE = 0.05;
    public const TVQ_RATE = 0.09975;

    /**
     * Calculate taxes for a given subtotal and province.
     *
     * @return array{subtotal: float, tps: float, tvq: float, total: float}
     */
    public function calculate(float $subtotal, string $province = 'QC'): array
    {
        $tps = round($subtotal * self::TPS_RATE, 2);
        $tvq = 0.0;

        if (strtoupper($province) === 'QC') {
            $tvq = round($subtotal * self::TVQ_RATE, 2);
        }

        $total = round($subtotal + $tps + $tvq, 2);

        return [
            'subtotal' => $subtotal,
            'tps' => $tps,
            'tvq' => $tvq,
            'total' => $total,
        ];
    }
}
