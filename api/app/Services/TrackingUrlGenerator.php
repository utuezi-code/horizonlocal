<?php

namespace App\Services;

class TrackingUrlGenerator
{
    private const CARRIERS = [
        'canada_post' => 'https://www.canadapost-postescanada.ca/track-reperage/en#/search?searchFor=',
        'purolator' => 'https://www.purolator.com/en/shipping/tracker.page?pin=',
        'fedex' => 'https://www.fedex.com/apps/fedextrack/?action=track&trackingnumber=',
        'ups' => 'https://www.ups.com/track?tracknum=',
        'dhl' => 'https://www.dhl.com/en/express/tracking.html?AWB=',
        'canpar' => 'https://www.canpar.com/en/operations/TrackShipment.jsp?reference=',
        'dhl_ecommerce' => 'https://webtrack.dhlglobalmail.com/?trackingnumber=',
    ];

    /**
     * Generate a tracking URL for a given carrier and tracking number.
     */
    public function generate(string $carrier, string $trackingNumber): ?string
    {
        $carrierKey = strtolower(str_replace([' ', '-'], '_', $carrier));

        if (isset(self::CARRIERS[$carrierKey])) {
            return self::CARRIERS[$carrierKey] . urlencode($trackingNumber);
        }

        return null;
    }
}
