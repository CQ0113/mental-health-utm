<?php

namespace App\Enums;

enum AttendanceStatus: string
{
    case Pending = 'pending';
    case Present = 'present';
    case Absent = 'absent';
    case Excused = 'excused';
}
