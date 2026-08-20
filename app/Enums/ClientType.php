<?php

namespace App\Enums;

enum ClientType: string
{
    case Student = 'student';
    case Staff = 'staff';
    case Alumni = 'alumni';
}
