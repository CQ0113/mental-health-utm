<?php

namespace App\Enums;

enum AppointmentType: string
{
    case New = 'new';
    case FollowUp = 'follow_up';
}
