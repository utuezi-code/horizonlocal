<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function check(): JsonResponse
    {
        $dbOk = false;
        $redisOk = false;

        try {
            DB::connection()->getPdo();
            $dbOk = true;
        } catch (\Exception) {}

        try {
            Redis::ping();
            $redisOk = true;
        } catch (\Exception) {}

        $status = $dbOk && $redisOk ? 'ok' : 'degraded';

        return response()->json([
            'status'   => $status,
            'database' => $dbOk ? 'ok' : 'error',
            'redis'    => $redisOk ? 'ok' : 'error',
            'version'  => config('app.version', '2.0.0'),
        ], $status === 'ok' ? 200 : 503);
    }
}
