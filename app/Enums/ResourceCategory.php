<?php

namespace App\Enums;

enum ResourceCategory: string
{
    case Stress = 'stress';
    case Anxiety = 'anxiety';
    case Sleep = 'sleep';
    case Support = 'support';
}
