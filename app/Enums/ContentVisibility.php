<?php

namespace App\Enums;

enum ContentVisibility: string
{
    case Draft = 'draft';
    case Published = 'published';
    case Hidden = 'hidden';
    case Deleted = 'deleted';
}
