<?php

namespace App\Enums;

enum ServiceSessionMode: string
{
    case Physical = 'physical';
    case Online = 'online';
    case Hybrid = 'hybrid';
}
