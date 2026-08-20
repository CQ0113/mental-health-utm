<?php

namespace App\Enums;

enum AttendanceMethod: string
{
    case Manual = 'manual';
    case PhysicalQr = 'physical_qr';
    case OnlineAuto = 'online_auto';
}
